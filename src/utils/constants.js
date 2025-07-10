/**
 * ▼▼▼▼▼　年度切替時に新しくするデータ　ここから　▼▼▼▼▼
 */
export const THIS_FISCAL_YEAR = "2025"; // 年度切り替え。通常、4月始まり3月終わり
/**
 * ▲▲▲▲▲　年度切替時に新しくするデータ　ここまで　▲▲▲▲▲
 */

/**
 * 大会関連のデータ
 */
// 大会カテゴリー
// export const CATEGORIES = [
//     "U-12（ジュニア）",
//     "U-15（ジュニアユース）",
//     "U-18（ユース）",
//     "WOMAN",
// ]

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
export const PICKUP_NEWS_API_URL = "https://vfdnlurtfj.execute-api.ap-northeast-1.amazonaws.com/prod/items";
// メディアのAPIGatewayのエンドポイント
export const MEDIA_API_URL = "https://fyxwvf4vfc.execute-api.ap-northeast-1.amazonaws.com/prod/items";
// お問い合わせのAPIGatewayのエンドポイント
export const INQUIRY_API_URL = "https://ihdezl8qwe.execute-api.ap-northeast-1.amazonaws.com/prod/items";
// クラブ情報のAPIGatewayのエンドポイント
export const CLUB_INFO_API_URL = "https://r9w3fg2ip8.execute-api.ap-northeast-1.amazonaws.com/prod/items";
// 試合情報のAPIGatewayのエンドポイント
export const MATCH_API_URL = "https://dvk11mi4fh.execute-api.ap-northeast-1.amazonaws.com/prod/items";
// 試合情報のAPIGatewayのエンドポイント
export const MATCH_API_URL_V2 = "https://c5z0e67x9k.execute-api.ap-northeast-1.amazonaws.com/prod/items";
// メンバー情報のAPIGatewayのエンドポイント
export const MEMBER_API_URL = "https://sirvr7hb77.execute-api.ap-northeast-1.amazonaws.com/prod/items"
// コネクターのAPIGatewayのエンドポイント
export const CONNECTER_API_URL = "https://x9etjju7dd.execute-api.ap-northeast-1.amazonaws.com/prod/items";
// 写真のAPIGatewayのエンドポイント
export const PICS_API_URL = "https://ooscpu0ezc.execute-api.ap-northeast-1.amazonaws.com/prod/items";
// 大会日程（アーカイブ）のエンドポイント
export const ARCHIVE_API_URL = "https://64py1m88d8.execute-api.ap-northeast-1.amazonaws.com/prod/items";
// 速報閲覧・入力画面開発用テーブルへつなぐエンドポイント
export const TEST_MATCH_API_URL = "https://w8i71q6qhl.execute-api.ap-northeast-1.amazonaws.com/prod/items";


/**
 * 固有名詞及び定数
 */
// Cognitoのユーザー情報から属性を取得・ローカルストレージに保存する際のキー名
export const USER_ATTR_EMAIL = "email";
export const USER_ATTR_MEMBERSHIP_TYPE = "membershipType";
export const USER_ATTR_SESSION_ID = "sessionId";
export const USER_ATTR_SUB = "userAttrSub"; // UUID。Cognitoのsub情報と同じ
export const ID_TOKEN_FOR_AUTH = "idTokenForAuth"; // APIGatewayの認可情報

// ローカルストレージでgetItem, setItemをするときのキー
// 主にDynamoDBからデータを取得する際に使われるRequestBodyとなることが多い
export const CHAMPIONSHIP_ID = "championshipId";
export const MATCH_ID = "matchId";  