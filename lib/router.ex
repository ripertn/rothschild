defmodule Server.Router do 
  use Plug.Router
  plug Plug.Logger
  plug Plug.Static, at: "/public", from: :rothschild

  plug(:match)
  plug(:dispatch)

  get "/", do: send_resp(conn, 200, "Welcome")

  get "api/wallet", do: conn |> put_resp_content_type("application/json") |> send_resp(200, Wallet.getWallet |> Poison.encode!())

  require EEx
  EEx.function_from_file :defp, :layout, "web/layout.html.eex", [:render]

  get _ do
    conn = conn |> fetch_query_params()
    render = Reaxt.render!(:app,%{path: conn.request_path, cookies: conn.cookies, query: conn.params},30_000)
    send_resp(put_resp_header(conn,"content-type","text/html;charset=utf-8"), render.param || 200,layout(render))
  end

  match _, do: send_resp(conn, 404, "Page Not Found")

end