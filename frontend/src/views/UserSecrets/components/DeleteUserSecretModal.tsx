import { useState } from "react";

import { createNotification } from "@app/components/notifications";
import { Button, FormLabel,Input, Modal, ModalClose, ModalContent } from "@app/components/v2";
import { useDeletePersonalSecret } from "@app/hooks/api/personalSecrets/queries";
import { UsePopUpState } from "@app/hooks/usePopUp";

export type DeleteModalData = { secretId: string; secretName: string };

type Props = {
  popUp: UsePopUpState<["deleteSecret"]>;
  handlePopUpToggle: (popUpName: keyof UsePopUpState<["deleteSecret"]>, state?: boolean) => void;
};

export const DeleteSecretModal = ({
  popUp: {
    deleteSecret: { isOpen, data }
  },
  handlePopUpToggle
}: Props) => {
  const { mutateAsync, isLoading } = useDeletePersonalSecret();

  const [confirmationText, setConfirmationText] = useState("");

  const onDelete = async () => {
    try {
      if (confirmationText !== "DELETE") {
        createNotification({
          text: "Confirmation text is incorrect",
          type: "error"
        });
        return;
      }

      const secretData = data as DeleteModalData;

      if (!secretData || !secretData.secretId) {
        return;
      }

      await mutateAsync(secretData?.secretId);
      createNotification({
        text: "Successfully deleted secret",
        type: "success"
      });
      setConfirmationText("");
      handlePopUpToggle("deleteSecret", false);
    } catch (err) {
      console.error(err);
      createNotification({
        text: "Failed to delete secret",
        type: "error"
      });
    }
  };

  const onClickCancel = () => {
    handlePopUpToggle("deleteSecret", false);
    setConfirmationText("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        handlePopUpToggle("deleteSecret", open);
      }}
    >
      <ModalContent
        title={`Are you sure you want to delete secret: '${
          (data as DeleteModalData)?.secretName ?? ""
        }' `}
        subTitle={<div>This action can not be undone.</div>}
      >
        <FormLabel label="Type 'DELETE' to confirm" className="mb-2" />
        <Input value={confirmationText} onChange={(e) => setConfirmationText(e.target.value)} />

        <div className="mt-8 flex items-center">
          <Button
            className="mr-4"
            type="submit"
            isDisabled={isLoading}
            isLoading={isLoading}
            onClick={() => onDelete()}
          >
            Delete secret
          </Button>
          <ModalClose asChild>
            <Button onClick={() => onClickCancel()} variant="plain" colorSchema="secondary">
              Cancel
            </Button>
          </ModalClose>
        </div>
      </ModalContent>
    </Modal>
  );
};
