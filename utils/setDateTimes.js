function setDateTimes(date, time) {
  const newDate = new Date(date);
  const time_split = time.split(":");
  const h = Number(time_split[0]);
  const m = Number(time_split[1]);
  newDate.setHours(h, m, 0, 0);

  return newDate;
}

module.exports = setDateTimes;
