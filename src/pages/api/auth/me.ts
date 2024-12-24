import { AuthenticatedRequest, authMiddleware } from "@/utils/verifyJWT";
import { NextApiRequest, NextApiResponse } from 'next';


const handler = (req: AuthenticatedRequest, res: NextApiResponse) => {
  // 認証が成功すると、req.user にデコードされたユーザー情報が格納される
  const userAddress = req.user?.address;
  console.log('✅test Ok Me', userAddress)

  if(!userAddress) {
    return res.status(200).json({
        isLogin: false
    });
  }

  return res.status(200).json({
    isLogin: true
  });
};

export default authMiddleware(handler);
