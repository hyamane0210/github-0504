/**
 * セッション管理のためのユーティリティ関数
 * ユーザーセッションの状態を追跡し、初回訪問と再訪問を区別します
 */

// セッションストレージのキー
const SESSION_VISITED_KEY = "session_visited"
const SESSION_INITIAL_REDIRECT_DONE = "session_initial_redirect_done"

/**
 * 現在のセッションで既にアプリを訪問したかどうかを確認
 * @returns {boolean} 現在のセッションで訪問済みの場合はtrue
 */
export function hasVisitedInSession(): boolean {
  if (typeof window === "undefined") return false

  try {
    return sessionStorage.getItem(SESSION_VISITED_KEY) === "true"
  } catch (error) {
    console.error("セッションストレージへのアクセスエラー:", error)
    return false
  }
}

/**
 * 現在のセッションで訪問済みとしてマーク
 */
export function markVisitedInSession(): void {
  if (typeof window === "undefined") return

  try {
    sessionStorage.setItem(SESSION_VISITED_KEY, "true")
  } catch (error) {
    console.error("セッションストレージへの書き込みエラー:", error)
  }
}

/**
 * 初回リダイレクトが完了したかどうかを確認
 * @returns {boolean} 初回リダイレクトが完了している場合はtrue
 */
export function hasInitialRedirectDone(): boolean {
  if (typeof window === "undefined") return false

  try {
    return sessionStorage.getItem(SESSION_INITIAL_REDIRECT_DONE) === "true"
  } catch (error) {
    console.error("セッションストレージへのアクセスエラー:", error)
    return false
  }
}

/**
 * 初回リダイレクトが完了したとしてマーク
 */
export function markInitialRedirectDone(): void {
  if (typeof window === "undefined") return

  try {
    sessionStorage.setItem(SESSION_INITIAL_REDIRECT_DONE, "true")
  } catch (error) {
    console.error("セッションストレージへの書き込みエラー:", error)
  }
}

/**
 * セッション訪問状態をリセット（テスト用）
 */
export function resetSessionVisit(): void {
  if (typeof window === "undefined") return

  try {
    sessionStorage.removeItem(SESSION_VISITED_KEY)
    sessionStorage.removeItem(SESSION_INITIAL_REDIRECT_DONE)
  } catch (error) {
    console.error("セッションストレージからの削除エラー:", error)
  }
}

