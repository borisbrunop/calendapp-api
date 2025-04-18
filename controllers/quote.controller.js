const { Op, Sequelize } = require("sequelize");
const sequelize = require("../config/sequilizeConnection");
var initModels = require("../models/init-models");
const paramsValidate = require("../utils/validateParams");
const { format, addWeeks, subWeeks, setHours, setMinutes, parse } = require("date-fns");
var models = initModels(sequelize);
const bcrypt = require("bcrypt");
const findWeekDay = require("../utils/findWeekday");
const setDateTimes = require("../utils/setDateTimes");
const notifications = require("../utils/notifications");
const { QUOTES_STATUS } = require("../const/Quotes");
const { formatInTimeZone } = require("date-fns-tz");
const saltRounds = 10;

async function create(req, res) {
  try {
    //Valid Params
    const validParams = ["day"];
    const params = paramsValidate(validParams, req.body);

    if (!params) {
      res.status(200).json({ message: "Bad request", error: true });
      return;
    }

    // EXECUTE ADD NEW USER IF IS SENT
    if (
      params.patient_id === "new" &&
      !!params.new_patient &&
      req.user.dataValues.role === "pro"
    ) {
      const checkUser = await models.user.findOne({
        where: { email: params.new_patient.email },
      });
      if (!!checkUser) {
        res.status(200).json({ message: "User already existis", error: true });
        return;
      }
      const result = await models.user.create({
        email: params.new_patient.email,
        name: params.new_patient.name,
        pass: bcrypt.hashSync("1234", saltRounds),
      });
      if (!result) {
        res.status(200).json({ message: "Error creating user", error: true });
        return;
      }
      params.patient_id = result.id;
    }

    // EXECUTE ADD CONCURRENT QUOTES IF IS SENT
    if (
      params.concurrent_weeks_amount &&
      params.concurrent_quote_times
    ) {
      //   const result = addWeeks(new Date(2014, 8, 1), 4)
      const response = {
        ok: [],
        not_ok: [],
      };

      for (let c of params.concurrent_quote_times) {
        const startDate = findWeekDay[c.week_day](new Date());
        for (var i = 0; i <= params.concurrent_weeks_amount - 1; i++) {
          const nextWeekDate = addWeeks(startDate, i);
          const body = {
            from: setDateTimes(nextWeekDate, c.from),
            to: setDateTimes(nextWeekDate, c.to),
            patient_id: params.patient_id,
            provider_id: req.user.dataValues.role === "pro" ? req.user.dataValues.id : params.provider_id,
            status_id: 1,
            quote_type_id: c.quote_type_id,
            notes: params.notes || "",
          };
          const checkQuote = await models.quote.findOne({
            where: {
              from: body.from,
              to: body.to,
              provider_id: body.provider_id,
              status_id: body.status_id,
            },
          });
          if (!checkQuote) {
            const newQuote = await models.quote.create(body);
            if (!newQuote) {
              response.not_ok.push(body);
            }
            if (!!newQuote) {
              response.ok.push(body);
            }
          }
          if (!!checkQuote) {
            response.not_ok.push(body);
          }
        }
      }
      /// CONCURRENT NOTIFICATIONS
      if(response.ok?.length > 0){
        await notifications.sendNotification([{
          user: req.user.dataValues.role === "pro" ? params.patient_id : params.provider_id,
          notification: notifications.NOTIFICATIONS.CONCURRENT_QUOTE_CREATED
        }])
      }
      notifications.send_schedule_starting([
        ...response.ok.map((v) => ({
          user: params.provider_id ? params.provider_id : req.user.id,
          notification: notifications.NOTIFICATIONS.QUOTES_STARTING,
          time: v.from
        })),
        ...response.ok.map((v) => ({
          user: params.patient_id,
          notification: notifications.NOTIFICATIONS.QUOTES_STARTING,
          time: v.from
        })),
      ])
      notifications.send_schedule_boolean([
        ...response.ok.map((v) => ({
          user: params.provider_id ? params.provider_id : req.user.id,
          notification: notifications.NOTIFICATIONS.QUOTES_FINISH,
          time: v.to
        })),
        ...response.ok.map((v) => ({
          user: params.patient_id,
          notification: notifications.NOTIFICATIONS.QUOTES_FINISH,
          time: v.to
        })),
      ])
      res.status(200).json(response);
      return;
    }

    const find_quote = await models.quote_time.findOne({
      include: [
        {
          model: models.quote_type,
          as: "quote_type",
        },
      ],
      where: { id: params.quote_time_id },
    });

    if (!find_quote) {
      res.status(200).json({ message: "Quote not found", error: true });
      return;
    }

    const quote_time = find_quote.dataValues;
    const quote_type = find_quote.dataValues.quote_type.dataValues;

    const [fromHoursStr, fromMinutesStr] = quote_time.from.split(":")
    const [toHoursStr, toMinutesStr] = quote_time.to.split(":")
    const [monthStr, dayStr, yearStr] = params.day.split("-")

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // Month from input string (1-12)
    const day = parseInt(dayStr, 10);
    const fromHours = parseInt(fromHoursStr, 10);
    const fromMinutes = parseInt(fromMinutesStr, 10);
    const toHours = parseInt(toHoursStr, 10);
    const toMinutes = parseInt(toMinutesStr, 10);

    // 3. Use Date.UTC() - NOTE: Month is 0-indexed here!
    const FromUtcTimestamp = Date.UTC(year, month - 1, day, fromHours, fromMinutes);
    const toUtcTimestamp = Date.UTC(year, month - 1, day, toHours, toMinutes);

    // 4. Create the Date object from the UTC timestamp
    const from = new Date(FromUtcTimestamp);
    const to = new Date(toUtcTimestamp);
  

    // PATIENT CREATE QUOTE
    let body = {};
    if (req.user.dataValues.role === "pat") {
      //VALIDATES
      if (!params.answers && !!quote_type.questions && !params.is_my_provider) {
        res
          .status(200)
          .json({ message: "Complete questions to create quote", error: true });
        return;
      }
      if (Number(req.user.dataValues.id) === Number(quote_type.provider_id)) {
        res
          .status(200)
          .json({ message: "You can't reserve to yourself", error: true });
        return;
      }
      const validate_provider_patient = await models.provider_patient.findOne({
        where: { patient_id: req.user.dataValues.id, provider_id:  quote_type.provider_id},
      });
      if(!validate_provider_patient){
        await models.provider_patient.create({
          provider_id: quote_type.provider_id,
          patient_id: req.user.dataValues.id,
        })
      }
      //ASIGN BODY
      body = {
        patient_id: req.user.dataValues.id,
        provider_id: quote_type.provider_id,
        from,
        to,
        notes: params.notes || "",
        quote_type_id: quote_time?.quote_type_id,
        status_id: 2,
        answers: params.answers,
      };
    }

    // PROVIDER CREATE QUOTE
    if (req.user.dataValues.role === "pro") {
      // VALIDATES
      if (Number(req.user.dataValues.id) === Number(params.patient_id)) {
        res
          .status(200)
          .json({ message: "You can't reserve to yourself", error: true });
        return;
      }
      if (!params.patient_id) {
        res.status(200).json({ message: "Bad request, patient", error: true });
        return;
      }
      const validate_patient = await models.user.findOne({
        where: { id: params.patient_id },
      });
      if (!validate_patient) {
        res.status(200).json({ message: "Patient invalid", error: true });
        return;
      }
      const validate_provider_patient = await models.provider_patient.findOne({
        where: { patient_id: params.patient_id, provider_id:  req.user.dataValues.id},
      });
      if(!validate_provider_patient){
        await models.provider_patient.create({
          provider_id: req.user.dataValues.id,
          patient_id: params.patient_id,
        })
      }
      // ASIGN BODY
      body = {
        patient_id: params.patient_id,
        provider_id: req.user.dataValues.id,
        from,
        to,
        notes: params.notes || "",
        quote_type_id: quote_time?.quote_type_id,
        status_id: 1,
      };
    }

    const checkQuote = await models.quote.findOne({
      where: {
        from: body.from,
        to: body.to,
        provider_id: body.provider_id,
        status_id: body.status_id,
      },
    });
    if (!checkQuote) {
      const quote = await models.quote.create(body);
      if (!quote) {
        res.status(200).json({ error: true, message: "Error creating quote" });
        return;
      }

      /// NOTIFICATIONS
      const send_to = req.user.dataValues.role === "pro" ? params.patient_id : quote_type.provider_id
      await notifications.sendNotification([{user: send_to, notification: notifications.NOTIFICATIONS.QUOTE_CREATED}])

      notifications.send_schedule_starting([
        {
          user: params.patient_id,
          notification: notifications.NOTIFICATIONS.QUOTES_STARTING,
          time: body.from
        },
        {
          user: req.user.dataValues.role === "pro" ? req.user.id : quote_type.provider_id,
          notification: notifications.NOTIFICATIONS.QUOTES_STARTING,
          time: body.from
        },
      ])
      
    notifications.send_schedule_boolean([
      {
        user: params.patient_id,
        notification: notifications.NOTIFICATIONS.QUOTES_FINISH,
        time: body.to
      },
      {
        user: req.user.dataValues.role === "pro" ? req.user.id : quote_type.provider_id,
        notification: notifications.NOTIFICATIONS.QUOTES_FINISH,
        time: body.to
      },
    ])

      res.status(200).json(quote);
      return;
    }
    if (!!checkQuote) {
      res.status(200).json({ error: true, message: "Quote already exists" });
      return;
    }
    res.status(200).json({ error: true, message: "Error creating quote" });
  } catch (error) {
    console.log("create Quote::Error ", error);
    res.status(500).json({ error });
  }
}

async function get_quotes_calendar(req, res) {
  try {
    const validParams = ["tz"];
    const params = paramsValidate(validParams, req.query);

    if (!params) {
      res.status(200).json({ message: "Bad request", error: true });
      return;
    }
    let where = {
      to: { [Op.gt]: subWeeks(new Date(), 4) },
      status_id: { [Op.ne]: 4 },
    };

    if (req.user.dataValues.role === "pat") {
      where.patient_id = req.user.dataValues.id;
    }
    if (req.user.dataValues.role === "pro") {
      where.provider_id = req.user.dataValues.id;
    }
    const quotes = await models.quote.findAll({
      attributes: [
        "id",
        "provider_id",
        "patient_id",
        "notes",
        "status_id",
        "quote_type_id",
        "answers",
        [
            Sequelize.fn('CONVERT_TZ', Sequelize.col('from'), '+00:00', params.tz) // The datetime value to format
            ,
          'from' // Alias for the formatted result
        ],
        [
          // Wrap CONVERT_TZ inside DATE_FORMAT
            Sequelize.fn('CONVERT_TZ', Sequelize.col('to'), '+00:00', params.tz),
          'to' // Alias for the formatted result
        ]
      ],
      include: [
        {
          model: models.quote_type,
          as: "quote_type",
        },
        {
          model: models.quote_status,
          as: "status",
        },
        {
          model: models.user,
          as: "patient",
          attributes: ["name", "id", "email", "summary"]
        },
        {
          model: models.user,
          as: "provider",
          attributes: ["name", "id", "email", "summary"]
        },
      ],
      order: [["from", "ASC"]],
      where,
    });

    const response = {};

    const timeZone = 'UTC';

    for (let q of quotes) {
      const day = formatInTimeZone(q.from, timeZone, "yyyy-MM-dd");
      const v = {
        ...q.dataValues,
        name: q.quote_type.dataValues.name,
        time: `${formatInTimeZone(q.from, timeZone, "k:mm")} - ${formatInTimeZone(q.to, timeZone, "k:mm")}`,
      };
      if (response[day]) {
        response[day].push(v);
      }
      if (!response[day]) {
        response[day] = [v];
      }
    }

    res.status(200).json(response);
  } catch (error) {
    console.log("get quotes calendar::Error ", error);
    res.status(500).json({ error });
  }
}

async function update_quote(req, res) {
  //Valid Params
  const validParams = ["status_id", "notes", "id"];
  const params = paramsValidate(validParams, req.body);

  if (!params) {
    res.status(200).json({ message: "Bad request", error: true });
    return;
  }
  try {
    const quote = await models.quote.findOne({
      where: { id: params.id },
    });
    if (
      Number(req.user.dataValues.id) !== Number(quote.dataValues.provider_id)
    ) {
      res.status(200).json({ message: "Can only edit provider", error: true });
      return;
    }
    if (!quote) {
      res.status(200).json({ message: "Quote not found", error: true });
      return;
    }
    if(params.status_id === QUOTES_STATUS.CONFIRMED && quote.status_id == QUOTES_STATUS.PENDING){
      await notifications.sendNotification([{user: quote.patient_id, notification: notifications.NOTIFICATIONS.CONFIRM_QUOTE, params: ["provider"]}])
    }
    if(params.status_id === QUOTES_STATUS.CANCELLED){
      let send_to = 0
      let params = []
      if(req.user.id === quote.provider_id){
          send_to = quote.patient_id
          params.push("provider")
        }
      if(req.user.id === quote.patient_id){
        send_to = quote.provider_id
        params.push("patient")
      }
      await notifications.sendNotification([{user: send_to, notification: notifications.NOTIFICATIONS.CANCEL_QUOTE, params}])
    }
    quote.status_id = params.status_id;
    quote.notes = params.notes;
    await quote.save();
    res.status(200).json(quote);
  } catch (error) {
    console.log("create user::Error ", error);
    res.status(500).json({ error });
  }
}

async function delete_quote(req, res) {
  //Valid Params
  const validParams = ["id"];
  const params = paramsValidate(validParams, req.body);

  if (!params) {
    res.status(200).json({ message: "Bad request", error: true });
    return;
  }
  try {
    const response = await models.quote.update(
      {
        status_id: 4,
      },
      {
        where: { id: params.id },
      }
    );
    if (!response) {
      res.status(200).json({ message: "Error updating quote", error: true });
      return;
    }
    res.status(200).json(response);
  } catch (error) {
    console.log("create user::Error ", error);
    res.status(500).json({ error });
  }
}

async function get_quotes(req, res) {
  try {
    const validParams = ["tz"];
    const params = paramsValidate(validParams, req.query);
  
    if (!params) {
      res.status(200).json({ message: "Bad request", error: true });
      return;
    }
    let where = {
      to: { [Op.lt]: new Date() },
      status_id: { [Op.ne]: 4 },
    };

    if (!!req.query.status) {
      where.status_id = req.query.status.split(",").map((s) => Number(s));
    }

    if (req.user.dataValues.role === "pat") {
      where.patient_id = req.user.dataValues.id;
    }
    if (req.user.dataValues.role === "pro") {
      where.provider_id = req.user.dataValues.id;
    }

    const quotes = await models.quote.findAll({
      attributes: [
        "id",
        "provider_id",
        "patient_id",
        "notes",
        "status_id",
        "quote_type_id",
        "answers",
        [
            Sequelize.fn('CONVERT_TZ', Sequelize.col('from'), '+00:00', params.tz) // The datetime value to format
            ,
          'from' // Alias for the formatted result
        ],
        [
          // Wrap CONVERT_TZ inside DATE_FORMAT
            Sequelize.fn('CONVERT_TZ', Sequelize.col('to'), '+00:00', params.tz),
          'to' // Alias for the formatted result
        ]
      ],
      include: [
        {
          model: models.quote_type,
          as: "quote_type",
        },
        {
          model: models.quote_status,
          as: "status",
        },
        {
          model: models.user,
          as: "patient",
          attributes: ["name", "id", "email", "summary"]
        },
        {
          model: models.user,
          as: "provider",
          attributes: ["name", "id", "email", "summary"]
        },
      ],
      order: [["from", "DESC"]],
      where,
    });
    if (!quotes) {
      res.status(200).json({ message: "Error getting quotes", error: true });
      return;
    }
    res.status(200).json(
      quotes.map((q) => ({
        ...q.dataValues,
        name: q.quote_type.dataValues.name,
        time: `${format(q.from, "k:mm")} - ${format(q.to, "k:mm")}`,
      }))
    );
  } catch (error) {
    console.log("create user::Error ", error);
    res.status(500).json({ error });
  }
}

module.exports = {
  create,
  get_quotes_calendar,
  update_quote,
  get_quotes,
  delete_quote,
};
