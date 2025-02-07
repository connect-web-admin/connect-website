/**
 * ▼▼▼▼▼　年度切替時に新しくするデータ　ここから　▼▼▼▼▼
 */
export const THIS_FISCAL_YEAR = "2024" // 年度切り替え。通常、4月始まり3月終わり
export const CHAMPIONSHIP_NAMES = [ // 各ページで大会名を使って表示を切り替えることがあるので、まとめておく。
    {
        fiscalYear: "2025",
        highSchool: ["第6回野鳥杯", "第11回高校生大会"],
        middleSchool: ["第6回野犬杯", "第11回中学生大会"],
        elementaryShool: ["第6回野良猫杯", "第11回小学生大会"],
        woman: ["第6回野外杯", "第11回女子大会"]
    },

    {
        fiscalYear: "2024",
        highSchool: ["第5回野鳥杯", "第10回高校生大会"],
        middleSchool: ["第5回野犬杯", "第10回中学生大会"],
        elementaryShool: ["第5回野良猫杯", "第10回小学生大会"],
        woman: ["第5回野外杯", "第10回女子大会"]
    }
]
// export const CHAMPIONSHIP_NAMES_FOR_HIGH_SCHOOL = ["第5回野鳥杯", "第10回高校生大会"] // 高校生向け大会一覧
// export const CHAMPIONSHIP_NAMES_FOR_MIDDLE_SCHOOL = ["第5回野鳥杯", "第10回高校生大会"] // 中学生向け大会一覧
// export const CHAMPIONSHIP_NAMES_FOR_ELEMENTARY_SCHOOL = ["第5回野鳥杯", "第10回高校生大会"] // 小学生向け大会一覧
// export const CHAMPIONSHIP_NAMES_FOR_WOMAN = ["第5回野鳥杯", "第10回高校生大会"]
/**
 * ▲▲▲▲▲　年度切替時に新しくするデータ　ここまで　▲▲▲▲▲
 */


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
export const INQUIRY_API_URL = "https://ihdezl8qwe.execute-api.ap-northeast-1.amazonaws.com/prod/items"

// ローカルストレージでgetItem, setItemをするときのキー
// 主にDynamoDBからデータを取得する際に使われるRequestBodyとなることが多い
export const CHAMPIONSHIP_ID = "championshipId"
export const MATCH_ID = "matchId"





// 主にDynamoDBから取得したデータをさらに細かくチームごとの変数に振り分けるために使われる
export const HOME_CLUB = "home_club"
export const AWAY_CLUB = "away_club"
export const HOME = "home"
export const AWAY = "away"