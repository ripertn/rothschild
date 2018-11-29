defmodule Quandl do

  @timeout ["recv_timeout": 30_000, "connect_timeout": 30_000]
  @api_key "W9xXGfe7z-xpoB2My9zr"


  def getCurrentValue(mnemo \\ "GLE") do
    url = "https://www.quandl.com/api/v3/datasets/EURONEXT/#{mnemo}.json?api_key=#{@api_key}"
    case :httpc.request(:get, {'#{url}',[]}, @timeout, []) do
        {:ok,{{_,200,_},head,body}} -> {:ok, Poison.decode!(body)}
        error -> {:error,error}
    end

  end
end