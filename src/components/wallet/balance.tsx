import { useAccount, useBalance } from "wagmi";

export function Balance() {
  const { address } = useAccount();

  const { data: default_ } = useBalance({ address });
  const { data: account_ } = useBalance({ address });

  return (
    <div>
      <div>Balance: {default_?.formatted}</div>
    </div>
  );
}
