import { useTranslation } from "react-i18next";
import Head from "next/head";

// import { ShareSecretPage } from "@app/views/ShareSecretPage";
import { UserSecretsPage } from "@app/views/UserSecrets";

const SecretApproval = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t("common.head-title", { title: t("user-secets.title") })}</title>
        <link rel="icon" href="/infisical.ico" />
        <meta property="og:image" content="/images/message.png" />
        <meta property="og:title" content={String(t("user-secets.title"))} />
        <meta name="og:description" content={String(t("user-secets.description"))} />
      </Head>
      <div className="h-full">
        <UserSecretsPage />
      </div>
    </>
  );
};

export default SecretApproval;

SecretApproval.requireAuth = true;
