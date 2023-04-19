import { OpenAI } from "langchain/llms/openai";
import { useState } from "react";
import { Button, Form, Container, Segment, Header, Message } from "semantic-ui-react";
import styles from '@/styles/Home.module.css'


const model = new OpenAI({ 
  openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,  // 本番環境ではサーバー側で実行すること
  temperature: 0.9,
});

export const TestPage = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [text, setText] = useState<string>("猫の飼い方について教えてください")
  const [answer, setAnswer] = useState<string>("")

  const onClickButton = async () => {
    setLoading(true);
    const res = await model.call(text);
    setAnswer(res);
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
