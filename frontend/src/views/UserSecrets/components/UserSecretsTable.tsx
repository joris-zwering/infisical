import { useState } from "react";
import { useTranslation } from "react-i18next";
import { faEye, faMagnifyingGlass, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  Button,
  EmptyState,
  IconButton,
  Input,
  Table,
  TableContainer,
  TableSkeleton,
  TBody,
  Td,
  Th,
  THead,
  Tooltip,
  Tr
} from "@app/components/v2";
import { useOrganization } from "@app/context";
import { useGetAllPersonalSecrets } from "@app/hooks/api/personalSecrets/queries";
import { UnencryptedPersonalSecret } from "@app/hooks/api/personalSecrets/types";
import { usePopUp } from "@app/hooks/usePopUp";

import { DeleteSecretModal } from "./DeleteUserSecretModal";
import { type DeleteModalData } from "./DeleteUserSecretModal";
import { EditUserSecretModal } from "./EditUserSecretModal";

const TableRow = ({
  row,
  onClickDeleteSecret,
  onClickViewSecret
}: {
  row: UnencryptedPersonalSecret;
  onClickDeleteSecret: (personalSecretId: string, secretName: string) => void;
  onClickViewSecret: (secretData: UnencryptedPersonalSecret) => void;
}) => {
  const { t } = useTranslation();

  const extractIdentifier = (secret: UnencryptedPersonalSecret) => {
    const parsedJson = JSON.parse(secret.secretValue || "{}");

    switch (secret.secretType) {
      case "WEB_LOGIN":
        return parsedJson?.username || "";
      case "CREDITCARD":
        return parsedJson?.cardNumber || "";
      case "SECURE_NOTE":
        return parsedJson?.title || "";
      default:
        return "";
    }
  };

  return (
    <Tr style={{ verticalAlign: "middle" }} key={row.secretName}>
        <Td onClick={() => onClickViewSecret(row)}>{row.secretName}</Td>
        <Td>{new Date(row.createdAt).toDateString()}</Td>
        <Td
          style={{
            alignItems: "center"
          }}
        >
          {t(`user-secets.secret_types.${row.secretType}`)}
        </Td>
        <Td
          style={{
            maxWidth: "500px"
          }}
        >
          {extractIdentifier(row)}
        </Td>
        <Td
          style={{
            alignItems: "center"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end"
            }}
          >
            <Button
              colorSchema="secondary"
              size="sm"
              variant="outline"
              style={{ marginRight: 20 }}
              leftIcon={<FontAwesomeIcon icon={faEye} />}
              onClick={() => onClickViewSecret(row)}
            >
              View
            </Button>
            <Tooltip content="Delete secret">
              <IconButton
                ariaLabel="Delete secret"
                colorSchema="secondary"
                onClick={() => {
                  onClickDeleteSecret(row.personalSecretKeyId, row.secretName);
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </IconButton>
            </Tooltip>
          </div>
        </Td>
      </Tr>
  );
};

export const UserSecretsTable = () => {
  const org = useOrganization();
  const { data, isLoading } = useGetAllPersonalSecrets(org.currentOrg?.id || "");
  const [search, setSearch] = useState<string>("");
  const { popUp, handlePopUpOpen, handlePopUpToggle } = usePopUp([
    "deleteSecret",
    "editSecrets"
  ] as const);

  const onClickDeleteSecret = async (personalSecretId: string, secretName: string) => {
    handlePopUpOpen("deleteSecret", {
      secretId: personalSecretId,
      secretName
    } as DeleteModalData);
  };

  const onClickViewSecret = async (secretData: UnencryptedPersonalSecret) => {
    handlePopUpOpen("editSecrets", {
      ...secretData
    });
  };

  return (
    <div>
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        leftIcon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
        placeholder="Search secrets..."
      />

      <TableContainer className="mt-4">
        <Table>
          <THead>
            <Tr>
              <Th>Secret Name</Th>
              <Th>Created</Th>
              <Th>Type</Th>
              <Th>Identifier</Th>
              <Th aria-label="button" />
            </Tr>
          </THead>
          <TBody>
            {isLoading && <TableSkeleton columns={5} rows={4} innerKey="personal-secrets" />}
            {!isLoading &&
              data
                ?.filter(
                  (secret) =>
                    secret.secretName.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
                    secret.secretValue.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
                    secret.secretType.toLocaleLowerCase().includes(search.toLocaleLowerCase())
                )
                .map((secret) => (
                  <TableRow
                    key={secret.personalSecretKeyId}
                    row={secret}
                    onClickDeleteSecret={onClickDeleteSecret}
                    onClickViewSecret={onClickViewSecret}
                  />
                ))}
            {!isLoading && data?.length === 0 && (
              <Tr>
                <Td colSpan={5}>
                  <EmptyState title="No secrets found" />
                </Td>
              </Tr>
            )}
          </TBody>
        </Table>
      </TableContainer>
      <DeleteSecretModal popUp={popUp} handlePopUpToggle={handlePopUpToggle} />
      <EditUserSecretModal popUp={popUp} handlePopUpToggle={handlePopUpToggle} />
    </div>
  );
};
