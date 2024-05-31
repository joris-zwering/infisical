import crypto from "crypto";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createNotification } from "@app/components/notifications";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalContent,
  Select,
  SelectItem
} from "@app/components/v2";
import { useOrganization } from "@app/context";
import { useUpdatePersonalSecret } from "@app/hooks/api/personalSecrets/queries";
import { type UnencryptedPersonalSecret } from "@app/hooks/api/personalSecrets/types";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { encryptFields } from "../helpers/cryptography";
import { SecretType } from "./AddUserSecretModal";
import { CreditCardInputs, SecretNoteInput,WebLoginInputs } from "./SecretInputs";

type Props = {
  popUp: UsePopUpState<["editSecrets"]>;
  handlePopUpToggle: (popUpName: keyof UsePopUpState<["editSecrets"]>, state?: boolean) => void;
};

type TFormSchema = z.infer<typeof FormSchema>;
export type EditModalData = UnencryptedPersonalSecret;

const FormSchema = z.object({
  secretName: z.string().max(100).min(5),
  secretValue: z.string().min(2),
  secretType: z.nativeEnum(SecretType)
});

export const EditUserSecretModal = ({ popUp, handlePopUpToggle }: Props) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting, defaultValues }
  } = useForm<TFormSchema>({
    resolver: zodResolver(FormSchema)
  });

  const { currentOrg } = useOrganization();

  const { mutateAsync } = useUpdatePersonalSecret();

  useEffect(() => {
    // if there is data in the popUp, set the default values
    if (popUp.editSecrets?.data) {
      const { secretName, secretValue, secretType } = popUp.editSecrets?.data as EditModalData;
      setValue("secretName", secretName);
      setValue("secretValue", secretValue);
      setValue("secretType", secretType as SecretType);
    }
  }, [popUp.editSecrets?.data]);

  const { t } = useTranslation();

  const onFormSubmit = async (data: TFormSchema) => {
    const privateKey = localStorage.getItem("PRIVATE_KEY");

    if (!privateKey) {
      createNotification({
        type: "error",
        text: "Your private key is missing. Please logout and login again."
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
        version: 1,
        personalSecretKeyId: (popUp.editSecrets?.data as EditModalData)
          ?.personalSecretKeyId as string,
        userId: (popUp.editSecrets?.data as EditModalData)?.userId as string,
        createdAt: (popUp.editSecrets?.data as EditModalData)?.createdAt,
        updatedAt: new Date()
      });
      createNotification({
        text: `Successfully created secret: ${data.secretName}`,
        type: "success"
      });

      reset();
      handlePopUpToggle("editSecrets", false);
    } catch (error) {
      createNotification({
        type: "error",
        text: "Failed to create secret"
      });
    }
  };

  return (
    <Modal
      isOpen={popUp.editSecrets.isOpen}
      onOpenChange={(isOpen) => {
        handlePopUpToggle("editSecrets", isOpen);
      }}
    >
      <ModalContent title={`Secret: '${(popUp?.editSecrets?.data as EditModalData)?.secretName}'`}>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Controller
            control={control}
            name="secretName"
            defaultValue={defaultValues?.secretName}
            render={({ field, fieldState: { error } }) => (
              <FormControl label="Secret Name" isError={Boolean(error)} errorText={error?.message}>
                <Input {...field} placeholder="Type your personal secret identifier" />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="secretType"
            defaultValue={defaultValues?.secretType}
            render={({ field, fieldState: { error } }) => (
              <FormControl label="Secret type" isError={Boolean(error)} errorText={error?.message}>
                <Select
                  defaultValue={field.value}
                  {...field}
                  onValueChange={(e) => {
                    setValue("secretValue", "");
                    field.onChange(e);
                  }}
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
            render={({ field }) => {
              if (watch("secretType") === SecretType.WEB_LOGIN) {
                const parsedJson = JSON.parse(field.value || "{}");

                const initialData = {
                  username: parsedJson?.username || "",
                  password: parsedJson?.password || ""
                };

                return (
                  <WebLoginInputs
                    initialData={initialData}
                    submit={(loginDetails) => {
                      field.onChange(JSON.stringify(loginDetails));
                    }}
                  />
                );
              } if (watch("secretType") === SecretType.CREDITCARD) {
                const parsedJson = JSON.parse(field.value || "{}");

                const initialData = {
                  cardNumber: parsedJson?.cardNumber || "",
                  expiryDate: parsedJson?.expiryDate || new Date(),
                  cvv: parsedJson.cvv || ""
                };

                return (
                  <CreditCardInputs
                    initialData={initialData}
                    submit={(cardDetails) => {
                      field.onChange(JSON.stringify(cardDetails));
                    }}
                  />
                );
              } if (watch("secretType") === SecretType.SECURE_NOTE) {
                const parsedJson = JSON.parse(field.value || "{}");
                const initialData = {
                  title: (parsedJson?.title as string) || "",
                  body: (parsedJson?.body as string) || ""
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
                const onChange = () => {
                  console.log("onChange");
                };

                return (
                  <>
                    <FormLabel label="Secret Value" className="mb-2" />

                    <Input {...field} placeholder="Type your secret value" onChange={onChange} />
                  </>
                );
              
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
              Update
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
