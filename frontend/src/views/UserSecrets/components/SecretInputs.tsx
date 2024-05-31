import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { FormControl, Input } from "@app/components/v2";

const CreditcardFormSchema = z.object({
  cardNumber: z
    .string()
    .min(16, {
      message: "Card number must be 16 digits"
    })
    .max(16, {
      message: "Card number must be 16 digits"
    }),
  expiryDate: z.date().min(new Date(), { message: "Expiry date must be in the future" }),
  cvv: z
    .string()
    .min(3, {
      message: "CVV must be 3 digits"
    })
    .max(3, {
      message: "CVV must be 3 digits"
    })
});

type TFormSchema = z.infer<typeof CreditcardFormSchema>;

export const CreditCardInputs = ({
  submit,
  initialData: { cardNumber, expiryDate, cvv }
}: {
  initialData: { cardNumber: string; expiryDate: string; cvv: string };
  submit: (cardDetails: { cardNumber: string; expiryDate: string; cvv: string }) => void;
}) => {
  const { control, getValues, watch } = useForm<TFormSchema>({
    resolver: zodResolver(CreditcardFormSchema),
    defaultValues: {
      cardNumber,
      expiryDate: new Date(expiryDate) || new Date(),
      cvv
    },
    mode: "onChange"
  });

  const onChange = () => {
    submit({
      cardNumber: getValues("cardNumber"),
      expiryDate: getValues("expiryDate").toString(),
      cvv: getValues("cvv")
    });
  };

  useEffect(() => {
    onChange();
  }, [watch()]);

  return (
    <>
      <div className="my-5 h-[0.5px] w-full bg-white/10" />
      <form>
        <Controller
          control={control}
          name="cardNumber"
          render={({ field, fieldState: { error } }) => (
            <FormControl
              label="Creditcard number"
              isError={Boolean(error)}
              errorText={error?.message}
            >
              <Input
                {...field}
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                type="number"
                placeholder="Type your creditcard number here"
              />
            </FormControl>
          )}
         />
        <Controller
          control={control}
          name="cvv"
          render={({ field, fieldState: { error } }) => (
            <FormControl label="cvv" isError={Boolean(error)} errorText={error?.message}>
              <Input
                {...field}
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                type="number"
                placeholder="Type your cvv here"
              />
            </FormControl>
          )}
         />

        <Controller
          control={control}
          name="expiryDate"
          render={({ field, fieldState: { error } }) => (
            <FormControl label="Expiry date" isError={Boolean(error)} errorText={error?.message}>
              <Input
                {...field}
                value={
                  // Format date to yyyy-mm-dd
                  field.value.toISOString().split("T")[0]
                }
                onChange={(e) => {
                  field.onChange(new Date(e.target.value));
                }}
                type="date"
              />
            </FormControl>
          )}
         />
      </form>
    </>
  );
};

const SecretNoteFormSchema = z.object({
  title: z.string().min(1, { message: "Title must be at least 1 character" }),
  body: z.string().min(1, { message: "Body must be at least 1 character" })
});

type TFormSchemaSecretNote = z.infer<typeof SecretNoteFormSchema>;

// Secret note contains a title and a body
export const SecretNoteInput = ({
  submit,
  initialData: { title, body }
}: {
  initialData: { title: string; body: string };
  submit: (noteDetails: { title: string; body: string }) => void;
}) => {
  const { control, getValues, watch } = useForm<TFormSchemaSecretNote>({
    resolver: zodResolver(SecretNoteFormSchema),
    defaultValues: {
      title,
      body
    },
    mode: "onChange"
  });

  const onChange = () => {
    submit({
      title: getValues("title"),
      body: getValues("body")
    });
  };

  useEffect(() => {
    onChange();
  }, [watch()]);

  return (
    <>
      <div className="my-5 h-[0.5px] w-full bg-white/10" />
      <form>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState: { error } }) => (
            <FormControl label="Title" isError={Boolean(error)} errorText={error?.message}>
              <Input
                {...field}
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                type="text"
                placeholder="Type your title here"
              />
            </FormControl>
          )}
         />
        <Controller
          control={control}
          name="body"
          render={({ field, fieldState: { error } }) => (
            <FormControl label="Body" isError={Boolean(error)} errorText={error?.message}>
              <Input
                {...field}
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                type="text"
                placeholder="Type your body here"
              />
            </FormControl>
          )}
         />
      </form>
    </>
  );
};

// Weblogin contains a username and a password
const WebLoginFormSchema = z.object({
  username: z.string().min(1, { message: "Username must be at least 1 character" }),
  password: z.string().min(12, { message: "Password must be at least 12 character" })
});

type TFormSchemaWebLogin = z.infer<typeof WebLoginFormSchema>;

export const WebLoginInputs = ({
  submit,
  initialData: { username, password }
}: {
  initialData: { username: string; password: string };
  submit: (loginDetails: { username: string; password: string }) => void;
}) => {
  const { control, getValues, watch } = useForm<TFormSchemaWebLogin>({
    resolver: zodResolver(WebLoginFormSchema),
    defaultValues: {
      username,
      password
    },
    mode: "onChange"
  });

  const onChange = () => {
    submit({
      username: getValues("username"),
      password: getValues("password")
    });
  };

  useEffect(() => {
    onChange();
  }, [watch()]);

  return (
    <>
      <div className="my-5 h-[0.5px] w-full bg-white/10" />
      <form>
        <Controller
          control={control}
          name="username"
          render={({ field, fieldState: { error } }) => (
            <FormControl label="Username" isError={Boolean(error)} errorText={error?.message}>
              <Input
                {...field}
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                type="text"
                placeholder="Type your username here"
              />
            </FormControl>
          )}
         />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState: { error } }) => (
            <FormControl label="Password" isError={Boolean(error)} errorText={error?.message}>
              <Input
                {...field}
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                type="text"
                placeholder="Type your password here"
              />
            </FormControl>
          )}
         />
      </form>
    </>
  );
};
