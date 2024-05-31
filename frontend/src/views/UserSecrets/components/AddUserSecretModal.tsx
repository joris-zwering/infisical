import crypto from "crypto";

import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createNotification } from "@app/components/notifications";
import {
  Button,
  FormControl,
  Input,
  Modal,
  ModalClose,
  ModalContent,
  Select,
  SelectItem
} from "@app/components/v2";
import { useOrganization } from "@app/context";
import { useCreatePersonalSecret } from "@app/hooks/api/personalSecrets/queries";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { encryptFields } from "../helpers/cryptography";
import { CreditCardInputs, SecretNoteInput, WebLoginInputs } from "./SecretInputs";

type Props = {
  popUp: UsePopUpState<["addSecret"]>;
  handlePopUpToggle: (popUpName: keyof UsePopUpState<["addSecret"]>, state?: boolean) => void;
};

export enum SecretType {
  WEB_LOGIN = "WEB_LOGIN",
  CREDITCARD = "CREDITCARD",
  SECURE_NOTE = "SECURE_NOTE"
}

const FormSchema = z.object({
  secretName: z.string().max(100).min(5),
  secretValue: z.string().min(2),
  secretType: z.nativeEnum(SecretType)
});

type TFormSchema = z.infer<typeof FormSchema>;

export const AddUserSecretModal = ({ popUp, handlePopUpToggle }: Props) => {
  const { currentOrg } = useOrganization();
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors }
  } = useForm<TFormSchema>({
    resolver: zodResolver(FormSchema)
  });
  const { mutateAsync } = useCreatePersonalSecret();

  const onAddSecret = async (data: TFormSchema) => {
    const privateKey = localStorage.getItem("PRIVATE_KEY");

    if (!privateKey) {
      createNotification({
        text: "Your private key is missing. Please logout and login again.",
        type: "error"
      });
      return;
    }

    const hashedPrivateKey = crypto.createHash("sha256").update(privateKey).digest();

    const {
      secretNameCipher,
      secretNameIV,
      secretNameAuthTag,
      secretValueAuthTag,
      secretValueCipher,
      secretValueIV,
      algorithm
    } = encryptFields({
      secretName: data.secretName,
      secretValue: data.secretValue,
      hashedPrivateKey
    });

    const organizationId = currentOrg?.id;

    try {
      await mutateAsync({
        secretNameCipher,
        secretValueCipher,
        secretNameIV,
        secretValueIV,
        secretNameAuthTag,
        secretValueAuthTag,
        algorithm,
        organizationId: organizationId as string,
        secretType: data.secretType,
        version: 1
      });
      createNotification(
        {
          text: `Successfully created secret: ${data.secretName}`,
          type: "success"
        },
        { autoClose: 3000, position: "top-right" }
      );

      reset();
      handlePopUpToggle("addSecret", false);
    } catch (error) {
      console.log(error);
      createNotification({
        text: "Failed to create secret. Please try again.",
        type: "error"
      });
    }
  };

  const onFormSubmit = (data: TFormSchema) => {
    if (errors && Object.keys(errors).length > 0) {
      return;
    }

    onAddSecret(data);
  };

  return (
    <Modal
      isOpen={popUp.addSecret.isOpen}
      onOpenChange={(isOpen) => {
        handlePopUpToggle("addSecret", isOpen);
      }}
    >
      <ModalContent
        title="Add Secret"
        subTitle={
          <div>This secret is only accessible to you (within this org) and nobody else.</div>
        }
      >
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Controller
            control={control}
            name="secretName"
            defaultValue=""
            render={({ field, fieldState: { error } }) => (
              <FormControl label="Secret Name" isError={Boolean(error)} errorText={error?.message}>
                <Input {...field} placeholder="Type your personal secret identifier" />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="secretType"
            defaultValue={SecretType.WEB_LOGIN}
            render={({ field, fieldState: { error } }) => (
              <FormControl label="Secret type" isError={Boolean(error)} errorText={error?.message}>
                <Select
                  defaultValue={field.value}
                  {...field}
                  onValueChange={(e) => field.onChange(e)}
                  className="w-full"
                >
                  {Object.values(SecretType).map((type) => (
                    <SelectItem value={type} key={type}>
                      {t(`user-secets.secret_types.${type}`)}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="secretValue"
            defaultValue=""
            render={({ field }) => {
              if (watch("secretType") === SecretType.CREDITCARD) {
                const parsedJson = JSON.parse(field.value || "{}");

                const initialData = {
                  cardNumber: parsedJson.cardNumber || "",
                  expiryDate: parsedJson.expiryDate || new Date(),
                  cvv: parsedJson.cvv || ""
                };

                return (
                  <CreditCardInputs
                    initialData={initialData}
                    submit={(cardDetails) => {
                      console.log(cardDetails);
                      field.onChange(JSON.stringify(cardDetails));
                    }}
                  />
                );
              } if (watch("secretType") === SecretType.WEB_LOGIN) {
                const parsedJson = JSON.parse(field.value || "{}");

                const initialData = {
                  username: parsedJson.username || "",
                  password: parsedJson.password || ""
                };

                return (
                  <WebLoginInputs
                    initialData={initialData}
                    submit={(loginDetails) => {
                      field.onChange(JSON.stringify(loginDetails));
                    }}
                  />
                );
              } if (watch("secretType") === SecretType.SECURE_NOTE) {
                const parsedJson = JSON.parse(field.value || "{}");
                const initialData = {
                  title: (parsedJson.title as string) || "",
                  body: (parsedJson.note as string) || ""
                };

                return (
                  <SecretNoteInput
                    initialData={initialData}
                    submit={(noteDetails) => {
                      field.onChange(JSON.stringify(noteDetails));
                    }}
                  />
                );
              }

              return <div />;
            }}
          />

          <div className="mt-8 flex items-center">
            <Button
              className="mr-4"
              type="submit"
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              onClick={() => onFormSubmit}
            >
              Create secret
            </Button>
            <ModalClose asChild>
              <Button variant="plain" colorSchema="secondary">
                Cancel
              </Button>
            </ModalClose>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};
