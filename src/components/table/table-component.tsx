import React, { useState } from "react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  ColumnDef,
  getPaginationRowModel,
} from "@tanstack/react-table";

type TableData = {
  id: number;
  status: string;
  serialNo: string;
  location: string;
  date: string;
};

const mockDataObj: TableData[] = [
  {
    id: 1,
    status: "Dismissed",
    serialNo: "C21321",
    location: "Wisconsin",
    date: "7/26/2023",
  },
  {
    id: 2,
    status: "Escalated",
    serialNo: "C21321",
    location: "Texas",
    date: "10/3/2023",
  },
  {
    id: 3,
    status: "Escalated",
    serialNo: "C21321",
    location: "Virginia",
    date: "9/4/2023",
  },
  {
    id: 4,
    status: "Todo",
    serialNo: "C21321",
    location: "West Virginia",
    date: "11/18/2023",
  },
  {
    id: 5,
    status: "Todo",
    serialNo: "C21321",
    location: "Texas",
    date: "6/27/2023",
  },
  {
    id: 6,
    status: "Escalated",
    serialNo: "C21321",
    location: "North Carolina",
    date: "2/6/2023",
  },
  {
    id: 7,
    status: "Escalated",
    serialNo: "C21321",
    location: "Michigan",
    date: "2/19/2023",
  },
  {
    id: 8,
    status: "Progress",
    serialNo: "C21321",
    location: "Virginia",
    date: "7/10/2023",
  },
  {
    id: 9,
    status: "Dismissed",
    serialNo: "C21321",
    location: "Ohio",
    date: "3/16/2023",
  },
  {
    id: 10,
    status: "Todo",
    serialNo: "C21321",
    location: "California",
    date: "12/19/2022",
  },
  {
    id: 11,
    status: "Escalated",
    serialNo: "C21321",
    location: "Florida",
    date: "3/12/2023",
  },
  {
    id: 12,
    status: "Escalated",
    serialNo: "C21321",
    location: "Florida",
    date: "5/25/2023",
  },
  {
    id: 13,
    status: "Dismissed",
    serialNo: "C21321",
    location: "California",
    date: "5/3/2023",
  },
  {
    id: 14,
    status: "Todo",
    serialNo: "C21321",
    location: "California",
    date: "7/19/2023",
  },
  {
    id: 15,
    status: "Dismissed",
    serialNo: "C21321",
    location: "Iowa",
    date: "2/26/2023",
  },
  {
    id: 16,
    status: "Progress",
    serialNo: "C21321",
    location: "Indiana",
    date: "3/31/2023",
  },
  {
    id: 17,
    status: "Todo",
    serialNo: "C21321",
    location: "Texas",
    date: "2/10/2023",
  },
  {
    id: 18,
    status: "Dismissed",
    serialNo: "C21321",
    location: "Mississippi",
    date: "12/3/2022",
  },
  {
    id: 19,
    status: "Escalated",
    serialNo: "C21321",
    location: "Virginia",
    date: "8/8/2023",
  },
  {
    id: 20,
    status: "Todo",
    serialNo: "C21321",
    location: "Nebraska",
    date: "3/11/2023",
  },
];

const TablePage: React.FC = () => {
  const [data] = useState(() => [...mockDataObj]);

  const columns: ColumnDef<TableData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllPageRowsSelectedHandler(),
          }}
        />
      ),
      cell: (item) => {
        console.clear();
        console.log(item.row.id);
        console.log(item.row.original);
        console.log(item.row.getIsSelected());

        return (
          <input
            type="checkbox"
            {...{
              checked: item.row.getIsSelected(),
              onChange: item.row.getToggleSelectedHandler(),
            }}
          />
        );
      },
    },
    {
      header: "Details",
      accessorKey: "id",
      cell: (info) => {
        return (
          <>
            <div>
              <p className="text-[12px] font-bold">Electrometer Alert</p>
              <p className="text-[8px]">
                <span className="text-[#D1AD78]">PG&E</span> •{" "}
                {info.row.original.id}
              </p>
            </div>
          </>
        );
      },
    },
    { header: "Status", accessorKey: "status" },
    { header: "Circuit", accessorKey: "serialNo" },
    { header: "Deployment", accessorKey: "location" },
    { header: "Time Received", accessorKey: "date" },
    {
      header: "Actions",
      cell: () => {
        return (
          <>
            <div className="flex gap-[12px]">
              <button className="border-btnBorder h-[32px] w-[68px] cursor-pointer rounded-md border px-2 py-2 text-[10px] text-radio-button hover:bg-radio-button/10">
                Pole View
              </button>
              <button className="border-btnBorder h-[32px] w-[68px] cursor-pointer rounded-md border px-2 py-2 text-[10px] text-radio-button hover:bg-radio-button/10">
                Map View
              </button>
            </div>
          </>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <table className="font-mond border-collapse text-[8px]">
        <tbody>
          {table.getHeaderGroups().map((headerGroup, i) => {
            return (
              <tr className="text-left" key={`headergroup-${i}`}>
                {headerGroup.headers.map((header, i) => {
                  return (
                    <th
                      className="px-4 pb-[28px] text-[10px] text-[#5B5B5B]"
                      key={`header-${i}`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </tbody>

        <tbody>
          {table.getRowModel().rows.map((row, i) => {
            return (
              <tr key={`row-${i}`} className="">
                {row.getVisibleCells().map((cell, i) => {
                  return (
                    <td key={`cell-${i}`} className="px-4 pb-[19px]">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/*  */}
      {/*  */}
      {/*  */}
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <button
          className="rounded border p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="rounded border p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="rounded border p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="rounded border p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="w-16 rounded border p-1"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default TablePage;
