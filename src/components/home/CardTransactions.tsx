import { Avatar, Card, CardBody } from "@nextui-org/react";
import React from "react";

const items = [
  {
    name: "テスト",
    amount: "10.00 OVL",
    date: "2024/4/19 12:00",
  },
  {
    name: "テスト",
    amount: "10.00 OVL",
    date: "2024/4/19 12:00",
  },
  {
    name: "テスト",
    amount: "10.00 OVL",
    date: "2024/4/19 12:00",
  },
  {
    name: "テスト",
    amount: "10.00 OVL",
    date: "2024/4/19 12:00",
  },
];

export const CardTransactions = () => {
  return (
    <Card className="bg-default-50 rounded-xl shadow-md px-3">
      <CardBody className="py-5 gap-4">
        <div>
          <span className="text-default-900 text-sm font-semibold">
            最近のトランザクション
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <div key={item.name} className="grid grid-cols-4 w-full">
              <div>
                <span className="text-default-900 font-semibold text-xs">
                  {item.name}
                </span>
              </div>
              <div>
                <span className="text-success text-xs">{item.amount}</span>
              </div>
              <div>
                <span className="text-default-500 text-xs">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
