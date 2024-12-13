import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"

export function withAuthGSSP<T extends { [key: string]: any }>(): GetServerSideProps<T | {}> {
  return async (ctx) => {
    console.log("withAuthGSSP -------------------------------------------------------------------");
    const { req } = ctx
    const token = req.cookies['token']

    console.log("token", token);
    

    if (!token) {
      return {
        props: { isLogin: false }
      }
    }

    return { props: {isLogin: true} }
  }
}