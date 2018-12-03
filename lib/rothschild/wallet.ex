defmodule Wallet do
  use GenServer

  @wallet ["GLE","KN","CO","ETL"]

  def start_link(_opts), do: GenServer.start_link(__MODULE__,_opts, name: __MODULE__)
  def init(_opts) do
    wallet = Enum.map(@wallet,fn mnemo -> ({:ok, d} = Quandl.getLastValue(mnemo) |> IO.inspect) |> elem(1) end)
    {:ok,wallet}
  end

  def pid(), do: Process.whereis __MODULE__
  def getWallet, do: GenServer.call(pid, :wallet)

  def handle_call(:wallet,_from,state), do: {:reply, state, state}
end