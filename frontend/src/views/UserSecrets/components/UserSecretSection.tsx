import { useEffect } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@app/components/v2";
import { useOrganization } from "@app/context";
import { usePopUp } from "@app/hooks";
import { useGetAllPersonalSecrets } from "@app/hooks/api/personalSecrets/queries";

import { AddUserSecretModal } from "./AddUserSecretModal";
import { UserSecretsTable } from "./UserSecretsTable";

export const UserSecretsSection = () => {
  const { popUp, handlePopUpOpen, handlePopUpToggle } = usePopUp([
    "addSecret",
    "modifySecret",
    "deleteSecret"
  ] as const);
  const org = useOrganization();

  const { refetch } = useGetAllPersonalSecrets(org.currentOrg?.id || "");

  useEffect(() => {
    refetch();
  }, [popUp.deleteSecret?.isOpen]);

  return (
    <div className="mb-6 rounded-lg border border-mineshaft-600 bg-mineshaft-900 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xl font-semibold text-mineshaft-100">Secrets</p>
        <Button
          colorSchema="primary"
          leftIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => {
            handlePopUpOpen("addSecret");
          }}
        >
          New Secret
        </Button>
      </div>
      <UserSecretsTable />
      <AddUserSecretModal popUp={popUp} handlePopUpToggle={handlePopUpToggle} />
    </div>
  );
};
