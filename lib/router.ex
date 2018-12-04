defmodule Server.Router do 
  use Plug.Router 
  # plug Plug.Static, from: "priv/static", at: "/static"

  plug(:match)
  plug(:dispatch)

  get "/", do: send_resp(conn, 200, "Welcome")

  get "/main.css", do: send_file(conn, 200, "priv/static/main.css")
  get "/bundle.js", do: send_file(conn, 200, "priv/static/bundle.js")
  get "/wallet", do: send_file(conn, 200, "priv/static/index.html")
  get "api/wallet", do: conn |> put_resp_content_type("application/json") |> send_resp(200, Wallet.getWallet |> Poison.encode!())

  match _, do: send_resp(conn, 404, "Page Not Found")

end