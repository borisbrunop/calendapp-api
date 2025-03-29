const { Op, Sequelize } = require("sequelize");
const sequelize = require("../config/sequilizeConnection");
var initModels = require("../models/init-models");
const paramsValidate = require("../utils/validateParams");
const { format } = require("date-fns");
const setDateTimes = require("../utils/setDateTimes");
var models = initModels(sequelize);

const week_days = {
  mon: [],
  tues: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  sun: [],
};

const check_week_days = ["mon", "tues", "wed", "thu", "fri", "sat", "sun"];

async function get_quote_time(req, res) {
  try {
    // req.user.dataValues

    //Valid Params
    const validParams = ["id", "tz"];
    const params = paramsValidate(validParams, req.query);

    if (!params) {
      res.status(200).json({ message: "Bad request", error: true });
      return;
    }

    const times = await models.quote_time.findAll({
      attributes: [
        "id",
        "quote_type_id",
        "status",
        "week_day",
        [
          Sequelize.fn(
            'DATE_FORMAT', // MySQL function to format dates/times
            Sequelize.fn('CONVERT_TZ', Sequelize.col('from'), '+00:00', params.tz), // The datetime value to format
            '%H:%i' // The format string: %H = Hour (00-23), %i = Minute (00-59)
          ),
          'from' // Alias for the formatted result
        ],
        [
          // Wrap CONVERT_TZ inside DATE_FORMAT
          Sequelize.fn(
            'DATE_FORMAT',
            Sequelize.fn('CONVERT_TZ', Sequelize.col('to'), '+00:00', params.tz),
            '%H:%i'
          ),
          'to' // Alias for the formatted result
        ]
      ],
      where: {
        quote_type_id: params.id,
        status: 1,
      },
      order: [
        ["from", "ASC"]
      ]
    });

    const response = {
      mon: [],
      tues: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    };

    for (let t of times) {
      const v = t.dataValues;
      response[v.week_day].push(v);
    }

    res.status(200).json(response);
  } catch (error) {
    console.log("quote typer::Error ", error);
    res.status(500).json({ error });
  }
}

async function get_time_to_add_quote_concurrent(req, res) {
  try {
    // req.user.dataValues

    //Valid Params
    const validParams = ["id", "tz"];
    const params = paramsValidate(validParams, req.query);

    if (!params) {
      res.status(200).json({ message: "Bad request", error: true });
      return;
    }

    const times = await models.quote_time.findAll({
      attributes: [
        "id",
        "quote_type_id",
        "status",
        "week_day",
        [
          Sequelize.fn(
            'DATE_FORMAT', // MySQL function to format dates/times
            Sequelize.fn('CONVERT_TZ', Sequelize.col('from'), '+00:00', params.tz), // The datetime value to format
            '%H:%i' // The format string: %H = Hour (00-23), %i = Minute (00-59)
          ),
          'from' // Alias for the formatted result
        ],
        [
          // Wrap CONVERT_TZ inside DATE_FORMAT
          Sequelize.fn(
            'DATE_FORMAT',
            Sequelize.fn('CONVERT_TZ', Sequelize.col('to'), '+00:00', params.tz),
            '%H:%i'
          ),
          'to' // Alias for the formatted result
        ]
      ],
      where: {
        quote_type_id: params.id,
        status: 1,
      },
      order: [
        ["from", "ASC"]
      ]
    });

    res.status(200).json(times);
  } catch (error) {
    console.log("quote typer::Error ", error);
    res.status(500).json({ error });
  }
}

async function get_time_to_add_quote(req, res) {
  try {
    // req.user.dataValues

    //Valid Params
    const validParams = ["id", "day", "tz"];
    const params = paramsValidate(validParams, req.query);

    if (!params) {
      res.status(200).json({ message: "Bad request", error: true });
      return;
    }

    const quotes = await models.quote.findAll({
      where: {
        to: { [Op.gt]: new Date() },
        provider_id: req.user.dataValues.id,
      },
    });

    const week_day = format(params.day, "E").toLowerCase();

    const times = await models.quote_time.findAll({
      attributes: [
        "id",
        "quote_type_id",
        "status",
        "week_day",
        [
          Sequelize.fn(
            'DATE_FORMAT', // MySQL function to format dates/times
            Sequelize.fn('CONVERT_TZ', Sequelize.col('from'), '+00:00', params.tz), // The datetime value to format
            '%H:%i' // The format string: %H = Hour (00-23), %i = Minute (00-59)
          ),
          'from' // Alias for the formatted result
        ],
        [
          // Wrap CONVERT_TZ inside DATE_FORMAT
          Sequelize.fn(
            'DATE_FORMAT',
            Sequelize.fn('CONVERT_TZ', Sequelize.col('to'), '+00:00', params.tz),
            '%H:%i'
          ),
          'to' // Alias for the formatted result
        ]
      ],
      where: {
        quote_type_id: params.id,
        status: 1,
        week_day,
      },
      order: [
        ["from", "ASC"]
      ]
    });

    const disabledTimes = [];

    for (let qu of quotes) {
      const q = qu.dataValues;
      if (format(q.from, "yyyy-MM-dd") === format(params.day, "yyyy-MM-dd")) {
        const quoteFormat = {
          from: format(q.from, "kk:mm:ss"),
          to: format(q.to, "kk:mm:ss"),
        };
        const findTime = times.find(
          (t) =>
            t.dataValues.from === quoteFormat.from &&
            t.dataValues.to === quoteFormat.to
        );
        if (findTime) disabledTimes.push(findTime.dataValues.id);
      }
    }

    res.status(200).json(
      times.map((t) => ({
        ...t.dataValues,
        disabled: disabledTimes.includes(t.id),
      }))
    );
  } catch (error) {
    console.log("quote typer::Error ", error);
    res.status(500).json({ error });
  }
}

async function create_quote_time(req, res) {
  try {
    // req.user.dataValues

    //Valid Params
    const validParams = ["week_day", "quote_type_id", "from", "to"];
    const params = paramsValidate(validParams, req.body);

    if (!params) {
      res.status(200).json({ message: "Bad request", error: true });
      return;
    }

    const body = {
      to: params.to,
      from: params.from,
      quote_type_id: params.quote_type_id,
      week_day: params.week_day,
    };

    const newTime = await models.quote_time.create(body);

    res.status(200).json(newTime);
  } catch (error) {
    console.log("quote typer::Error ", error);
    res.status(500).json({ error });
  }
}

async function update_quote_time(req, res) {
  try {
    // req.user.dataValues

    //Valid Params
    const validParams = ["id", "from", "to"];
    const params = paramsValidate(validParams, req.body);

    if (!params) {
      res.status(200).json({ message: "Bad request", error: true });
      return;
    }

    const newTime = await models.quote_time.update(
      {
        from: params.from,
        to: params.to,
      },
      {
        where: {
          id: params.id,
        },
      }
    );

    res.status(200).json(newTime);
  } catch (error) {
    console.log("quote typer::Error ", error);
    res.status(500).json({ error });
  }
}

async function delete_quote_time(req, res) {
  try {
    // req.user.dataValues

    //Valid Params
    const validParams = ["id"];
    const params = paramsValidate(validParams, req.body);

    if (!params) {
      res.status(200).json({ message: "Bad request", error: true });
      return;
    }

    const newTime = await models.quote_time.update(
      {
        status: 0,
      },
      {
        where: {
          id: params.id,
        },
      }
    );

    res.status(200).json(newTime);
  } catch (error) {
    console.log("quote typer::Error ", error);
    res.status(500).json({ error });
  }
}

module.exports = {
  get_quote_time,
  create_quote_time,
  update_quote_time,
  delete_quote_time,
  get_time_to_add_quote,
  get_time_to_add_quote_concurrent,
};
