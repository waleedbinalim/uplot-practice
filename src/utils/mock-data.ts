import {
  incrementalNumber,
  randFlightNumber,
  randPastDate,
  randState,
  randStatus,
} from "@ngneat/falso";

export type TableData = {
  id: number;
  status: string;
  serialNo: string;
  location: string;
  date: string;
};

const factory = incrementalNumber();

export const generateTableItem = (): TableData => ({
  id: factory(),
  status: randStatus({ type: "User Story" }),
  date: `${randPastDate()}`,
  serialNo: randFlightNumber(),
  location: randState(),
});

export const generateTableData = (amount: number = 4) => {
  const initialTasks = [];

  for (let i = 0; i < amount; i++) {
    const newTask = generateTableItem();
    initialTasks.push(newTask);
  }
  return initialTasks;
};
