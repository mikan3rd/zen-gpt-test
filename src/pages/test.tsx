import Head from "next/head";

import { TestPage } from "@/components/pages/test";

const Test = () => {
  return (
    <>
      <Head>
        <title>Zen GPT</title>
      </Head>
      <TestPage />
    </>
  );
};

export default Test;
