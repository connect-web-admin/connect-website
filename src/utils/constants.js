// 年度切り替え。通常、4月始まり3月終わり
export const THIS_FISCAL_YEAR = "2024"

// APIGatewayのエンドポイント
export const CLUB_API_URL = "https://tpkjy2xfx1.execute-api.ap-northeast-1.amazonaws.com/dev/items"
export const CONNECTER_API_URL = "https://x9etjju7dd.execute-api.ap-northeast-1.amazonaws.com/dev/items"
export const MATCH_API_URL = "https://dvk11mi4fh.execute-api.ap-northeast-1.amazonaws.com/dev/items"
export const TOPICS_API_URL = "https://hcr41st75h.execute-api.ap-northeast-1.amazonaws.com/dev/items"

// ローカルストレージでgetItem, setItemをするときのキー
// 主にDynamoDBからデータを取得する際に使われるRequestBodyとなることが多い
export const CHAMPIONSHIP_ID = "championshipId"
export const MATCH_ID = "matchId"
export const USER_ATTR_SUB = "userAttrSub" // UUID。Cognitoのsub情報と同じ
export const ID_TOKEN_FOR_AUTH = "idTokenForAuth" // APIGatewayの認可情報

// 主にDynamoDBから取得したデータをさらに細かくチームごとの変数に振り分けるために使われる
export const HOME_CLUB = "home_club"
export const AWAY_CLUB = "away_club"
export const HOME = "home"
export const AWAY = "away"