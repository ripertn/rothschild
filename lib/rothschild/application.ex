defmodule Rothschild.Application do
  use Application

  def start(_type, _args) do
    Rothschild.Supervisor.start_link([]) 
  end

end

defmodule Rothschild.Supervisor do
  use Supervisor

  def start_link(_opt), do: Supervisor.start_link(__MODULE__, _opt, name: __MODULE__)
  def init(_opt) do
    children = [
      Plug.Adapters.Cowboy.child_spec(:http, Server.Router, [], [port: 4001]),
      Wallet, # same as %{id: Wallet, start: {Wallet, :start_link, []}}
    ]

    Supervisor.init(children, [strategy: :one_for_one, name: Rothschild.Supervisor])

    # supervise(children, strategy: :simple_one_for_one)
  end
end
