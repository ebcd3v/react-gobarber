import React, { useMemo, useState, useEffect } from 'react';
import { MdChevronRight, MdChevronLeft } from 'react-icons/md';
import { utcToZonedTime } from 'date-fns-tz';
import {
  format,
  addDays,
  subDays,
  setMinutes,
  setSeconds,
  setHours,
  isBefore,
  parseISO,
  isEqual,
  startOfHour,
} from 'date-fns';
import api from '~/services/api';

import { Container, Time } from './styles';

const range = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export default function Dashboard() {
  const [schedule, setSchedule] = useState([]);
  const [date, setDate] = useState(new Date());

  const dateFormatted = useMemo(() => format(date, 'MMM do'), [date]);

  useEffect(() => {
    async function loadSchedule() {
      const response = await api.get('schedule', { params: { date } });
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const data = range.map(hour => {
        const checkDate = startOfHour(
          setSeconds(setMinutes(setHours(date, hour), 0), 0)
        );

        const compareDate = utcToZonedTime(checkDate, timezone);

        return {
          time: `${hour}:00h`,
          past: isBefore(compareDate, new Date()),
          appointment: response.data.find(a =>
            isEqual(parseISO(a.date), compareDate)
          ),
        };
      });

      setSchedule(data);
    }

    loadSchedule();
  }, [date]);

  useEffect(() => {
    console.tron.log(schedule);
  }, [schedule]);

  function handlePrevDay() {
    setDate(subDays(date, 1));
  }
  function handleNextDay() {
    setDate(addDays(date, 1));
  }

  return (
    <Container>
      <header>
        <button type="button" onClick={handlePrevDay}>
          <MdChevronLeft size={36} color="#FFF" />
        </button>
        <strong>{dateFormatted}</strong>
        <button type="button" onClick={handleNextDay}>
          <MdChevronRight size={36} color="#FFF" />
        </button>
      </header>

      <ul>
        {schedule.map(time => (
          <Time key={time.time} past={time.past} available={!time.appointment}>
            <strong>{time.time}</strong>
            <span>
              {time.appointment ? time.appointment.user.name : 'Available'}
            </span>
          </Time>
        ))}
      </ul>
    </Container>
  );
}
