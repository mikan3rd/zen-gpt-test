import { useState } from "react";

import { OpenAI } from "langchain/llms/openai";
import { CallbackManager } from "langchain/callbacks";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage } from "langchain/schema";


import { Button, Form, Container, Segment, Header, Message } from "semantic-ui-react";
import styles from '@/styles/Home.module.css'


const model = new OpenAI({ 
  openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,  // 本番環境ではサーバー側で実行すること
  temperature: 0.9,
});

const chat = new ChatOpenAI({
  openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,  // 本番環境ではサーバー側で実行すること
});

export const TestPage = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [text, setText] = useState<string>("「猫は液体」と言われる理由について子供が興味を引くように説明してください")
  const [answer, setAnswer] = useState<string>("")

  const onClickButton = async () => {
    setLoading(true);
    setAnswer("");

    // const res = await model.call(text);
    // console.log(res);
    // setAnswer(res.text);

    chat.streaming  = true;
    chat.callbackManager = CallbackManager.fromHandlers({
      async handleLLMNewToken(token: string) {
        setAnswer(prev => prev + token);
      },
    });
    await chat.call([
      new HumanChatMessage(text),
    ]);
    

    setLoading(false);
  }

  return (
    <>
      <main className={styles.main}>
        <Container>
          <Header>Zen GPT</Header>
          <Segment>
          <Form>
            <Form.Field>
            <Form.TextArea label={"質問を入力してください"} onChange={(e) => setText(e.target.value)} value={text} disabled={loading} />
            </Form.Field>
            <Button onClick={onClickButton} loading={loading}>Click</Button>
          </Form>
          </Segment>
          <Segment>
            <Message header="回答" content={answer} />
          </Segment>
          </Container>
      </main>
    </>
  )
}
