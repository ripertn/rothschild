defmodule Quandl do

  @timeout ["recv_timeout": 30_000, "connect_timeout": 30_000]
  @api_key "W9xXGfe7z-xpoB2My9zr"


  def getValueRaw(mnemo \\ "GLE") do
    url = "https://www.quandl.com/api/v3/datasets/EURONEXT/#{mnemo}.json?api_key=#{@api_key}" |> IO.inspect
    case :httpc.request(:get, {'#{url}',[]}, @timeout, []) do
        {:ok,{{_,200,_},head,body}} -> {:ok, Poison.decode!(body)}
        error -> {:error,error}
    end
  end

  def getLastValue(mnemo \\ "GLE") do
    startDate = "start_date=" <> (Date.utc_today |> Date.add(-5) |> Date.to_string)
    endDate = "end_date=" <> (Date.utc_today |> Date.to_string)
    url = "https://www.quandl.com/api/v3/datasets/EURONEXT/#{mnemo}.json?#{startDate}&#{endDate}&api_key=#{@api_key}"
    case :httpc.request(:get, {'#{url}',[]}, @timeout, []) do
      {:ok,{{_,200,_},head,body}} -> res = Poison.decode!(body)["dataset"]["data"] |> hd
        [date,open,high,low,last,volume,turnover] = res
        res = %{mnemo: mnemo, id: mnemo, date: date, open: open, high: high, low: low, last: last, volume: volume, turnover: turnover}
        {:ok, res}
      error -> {:error,error}
    end
  end
end