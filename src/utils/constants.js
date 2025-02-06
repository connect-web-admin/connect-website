// 年度切り替え。通常、4月始まり3月終わり
export const THIS_FISCAL_YEAR = "2024"


// CognitoのユーザープールIDおよびクライアントID
export const USER_POOL_ID = 'ap-northeast-1_nziYUPFda';
export const CLIENT_ID = '2l2tg8i2d5ncdo8sdmdtu1o4hn';

// 会員の種類
export const REGULAR = "regular"
export const PREMIUM = "premium"
export const CONNECTER = "connecter"

// Cognitoのユーザー情報から属性を取得・ローカルストレージに保存する際のキー名
export const USER_ATTR_EMAIL = 'email'
export const USER_ATTR_MEMBERSHIP_TYPE = 'custom:membership_type'
export const USER_ATTR_SESSION_ID = 'sid'
export const USER_ATTR_SUB = "userAttrSub" // UUID。Cognitoのsub情報と同じ
export const ID_TOKEN_FOR_AUTH = "idTokenForAuth" // APIGatewayの認可情報

// APIGatewayのエンドポイント
export const CLUB_API_URL = "https://tpkjy2xfx1.execute-api.ap-northeast-1.amazonaws.com/prod/items"
export const CONNECTER_API_URL = "https://x9etjju7dd.execute-api.ap-northeast-1.amazonaws.com/prod/items"
export const MATCH_API_URL = "https://dvk11mi4fh.execute-api.ap-northeast-1.amazonaws.com/prod/items"
export const TOPICS_API_URL = "https://hcr41st75h.execute-api.ap-northeast-1.amazonaws.com/prod/items"

// ローカルストレージでgetItem, setItemをするときのキー
// 主にDynamoDBからデータを取得する際に使われるRequestBodyとなることが多い
export const CHAMPIONSHIP_ID = "championshipId"
export const MATCH_ID = "matchId"

// 主にDynamoDBから取得したデータをさらに細かくチームごとの変数に振り分けるために使われる
export const HOME_CLUB = "home_club"
export const AWAY_CLUB = "away_club"
export const HOME = "home"
export const AWAY = "away"