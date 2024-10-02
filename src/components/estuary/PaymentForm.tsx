import { Button } from "@nextui-org/react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { FC } from "react";
import { PiCreditCardFill } from "react-icons/pi";

type PaymentFormProps = {
  amount: number;
  title: string;
  isDisabled: boolean;
};

export const PaymentForm: FC<PaymentFormProps> = ({
  amount,
  title,
  isDisabled,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    const paymentElement = elements.getElement(PaymentElement);
    paymentElement?.mount("#payment-element");

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:3000/estuary/aaa",
      },
    });

    if (result.error) {
      console.log("payment error", result.error);
    } else {
      console.log("payment success");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button
        variant="solid"
        color="primary"
        size="lg"
        fullWidth
        startContent={<PiCreditCardFill size={24} />}
        isDisabled={isDisabled}
      >
        決済へ進む
      </Button>
    </form>
  );
};
