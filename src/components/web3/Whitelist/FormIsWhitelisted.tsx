import { FormEvent, useState } from "react";
import { IsWhitelisted } from "./IsWhitelisted";

export function FormIsWhitelisted() {
  const [account_, setAccount] = useState<string>();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const account = formData.get("account_") as string;
    setAccount(account);
  }

  return (
    <div>
      <form onSubmit={submit}>
        <input name="account_" placeholder="account_" required />
        <button type="submit">IsWhitelisted</button>
      </form>
      {account_ && <IsWhitelisted account_={account_} />}
    </div>
  );
}
