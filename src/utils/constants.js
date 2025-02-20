/**
 * ▼▼▼▼▼　年度切替時に新しくするデータ　ここから　▼▼▼▼▼
 */
export const THIS_FISCAL_YEAR = "2024"; // 年度切り替え。通常、4月始まり3月終わり
export const CHAMPIONSHIPS = [ // 各ページで大会名を使って表示を切り替えることがあるので、まとめておく。
    // 単科大学(college)も大学(university)に含める
    {
        "年度": "2025",
        "カテゴリー": {
            "小学生": ["第6回野良猫杯", "第11回小学生大会"],
            "中学生": ["第6回野犬杯", "第11回中学生大会"],
            "高校生": ["第6回北海道高校生選手権大会", "第11回高校生大会"],
            "専門学生": ["第6回植物杯", "第11回専門学生大会"],
            "大学生": ["第6回大学杯", "第11回大学生大会"],
            "社会人": ["第6回湖沼杯", "第11回成人大会"],
            "女子": ["第6回野外杯", "第11回女子大会"],
            "フットサル": ["第6回体育杯", "第11回フットサル大会"],
            "混合": ["第11回ミックス大会"]
        }
    },

    {
        "年度": "2024",
        "カテゴリー": {
            "小学生": ["第5回野良猫杯", "第10回小学生大会"],
            "中学生": ["第5回野鳥杯", "第10回中学生大会"],
            "高校生": ["第5回北海道高校生選手権大会", "第10回高校生大会"],
            "専門学生": ["第5回植物杯", "第10回専門学生大会"],
            "大学生": ["第5回大学杯", "第10回大学生大会"],
            "社会人": ["第5回湖沼杯", "第10回成人大会"],
            "女子": ["第5回野外杯", "第10回女子大会"],
            "フットサル": ["第5回体育杯", "第10回フットサル大会"],
            "混合": ["第10回ミックス大会"]
        }
    }
];
/**
 * ▲▲▲▲▲　年度切替時に新しくするデータ　ここまで　▲▲▲▲▲
 */

/**
 * 大会関連のデータ
 */
// 大会名のデータ
export const CATEGORIES = [
    "小学生",
    "中学生",
    "高校生",
    "専門学生",
    "大学生",
    "社会人",
    "女子",
    "フットサル",
    "混合"
]

/**
 * 会員関連のデータ
 */
// 会員の種類
export const REGULAR = "regular";
export const PREMIUM = "premium";
export const CONNECTER = "connecter";

/**
 * システム関連のデータ
 */
// CognitoのユーザープールIDおよびクライアントID
export const USER_POOL_ID = 'ap-northeast-1_nziYUPFda';
export const CLIENT_ID = '2l2tg8i2d5ncdo8sdmdtu1o4hn';

// APIGatewayのエンドポイント
// サイト内コンテンツのAPIGatewayのエンドポイント
// お知らせのAPIGatewayのエンドポイント
export const TOPICS_API_URL = "https://hcr41st75h.execute-api.ap-northeast-1.amazonaws.com/prod/items";
// お問い合わせのAPIGatewayのエンドポイント
export const INQUIRY_API_URL = "https://ihdezl8qwe.execute-api.ap-northeast-1.amazonaws.com/prod/items";
// クラブ情報のAPIGatewayのエンドポイント
export const CLUB_API_URL = "https://tpkjy2xfx1.execute-api.ap-northeast-1.amazonaws.com/prod/items";
// 試合情報のAPIGatewayのエンドポイント
export const MATCH_API_URL = "https://dvk11mi4fh.execute-api.ap-northeast-1.amazonaws.com/prod/items";
// メンバー情報のAPIGatewayのエンドポイント
export const MEMBER_API_URL = ""
// コネクターのAPIGatewayのエンドポイント
export const CONNECTER_API_URL = "https://x9etjju7dd.execute-api.ap-northeast-1.amazonaws.com/prod/items";

/**
 * 固有名詞及び定数
 */
// Cognitoのユーザー情報から属性を取得・ローカルストレージに保存する際のキー名
export const USER_ATTR_EMAIL = "email";
export const USER_ATTR_MEMBERSHIP_TYPE = "custom:membership_type";
export const USER_ATTR_SESSION_ID = "sesId";
export const USER_ATTR_SUB = "userAttrSub"; // UUID。Cognitoのsub情報と同じ
export const ID_TOKEN_FOR_AUTH = "idTokenForAuth"; // APIGatewayの認可情報

// ローカルストレージでgetItem, setItemをするときのキー
// 主にDynamoDBからデータを取得する際に使われるRequestBodyとなることが多い
export const CHAMPIONSHIP_ID = "championshipId";
export const MATCH_ID = "matchId";  