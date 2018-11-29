defmodule Mix.Tasks.Webflow do
  use Mix.Task
  import Mix.Generator

  @shortdoc "Update your webflow files"
  def run(["all"]) do
    export = webflow_export
    gen_webflow_assets(export)
    gen_my_assets(export)
    gen_my_htmlcss(export)
  end
  def run(["html"]), do: gen_my_htmlcss(webflow_export)
  def run(["common"]), do: gen_webflow_assets(webflow_export)
  def run(["assets"]), do: gen_my_assets(webflow_export)
  def run(_), do: Mix.Shell.IO.error("usage : mix webflow html|common|assets|all")

  def req(url) do
    cookie = System.get_env("WEBFLOW_COOKIE")
    :httpc.request(:get,{'#{url}',if(cookie, do: [{'cookie','#{cookie}'}],else: [])},[],[])
  end

  defp webflow_export do
    :inets.start; Application.ensure_all_started(:ssl)
    Mix.Task.run "loadpaths"
    :httpc.set_options cookies: :enabled
    [project,login,pass] = webflow_conf = [:project,:login,:password] |> Enum.map(&get_in(Mix.Project.config,[:webflow,&1]))
    if Enum.all?(webflow_conf) do
      if !System.get_env("WEBFLOW_COOKIE") do
        body = ~s/{"username": "#{login}", "password": "#{pass}"}/
        :httpc.request(:post,{'https://webflow.com/dashboard/login',[],'application/json;charset=UTF-8',body},[],[])
      end
      IO.puts("https://webflow.com/api/sites/#{project}/export")
      {:ok,{{_,200,_},_,body}} = req("https://webflow.com/api/sites/#{project}/export")
      Poison.decode!(body)
    else
      throw ~s/Webflow task needs mix.exs project conf: webflow: %{project: "myproj",login: "fake login", password: "fake passphrase"}/
    end
  end

  defp gen_my_assets(export) do

    for %{"origFileName"=>file,"s3Url"=>url}<-export["fonts"] do
      {:ok,{{_,200,_},_,body}} = req(url)
      write_log("web/#{Mix.Project.config[:webflow].project}.webflow/fonts/#{file}",body)
    end
    for %{"origFileName"=>file,"s3Url"=>url}<-export["images"] do
      {:ok,{{_,200,_},_,body}} = req(url)
      write_log("web/#{Mix.Project.config[:webflow].project}.webflow/images/#{file}",body)
    end
  end

  defp gen_webflow_assets(export) do
    write_log("web/#{Mix.Project.config[:webflow].project}.webflow/css/normalize.css",export["cssNormalize"])
    write_log("web/#{Mix.Project.config[:webflow].project}.webflow/css/webflow.css",export["cssBootflow"])
    write_log("web/#{Mix.Project.config[:webflow].project}.webflow/js/webflow.js",export["siteJs"])
    write_log("web/#{Mix.Project.config[:webflow].project}.webflow/js/modernizr.js",export["modernizr"])
  end

  @accents %{?a=>[?à,?â], ?c=>[?ç], ?e=>[?é,?è,?ê,?ë], ?i=>[?î,?ï], ?o=>[?ô], ?u=>[?ù,?û,?ü]}
  def slugify(x), do: (x |> String.downcase |> slugify([]))
  def slugify("",acc), do: (acc |> Enum.reverse |> to_string)
  for {unaccent,accents}<-@accents do
    def slugify(<<c::utf8,rest::binary>>,acc) when c in unquote(accents), do: slugify(rest,[unquote(unaccent)|acc])
  end
  def slugify(<<c::utf8,rest::binary>>,acc) when c in ?a..?z or c in ?0..9, do: slugify(rest,[c|acc])
  def slugify(<<_c::utf8,rest::binary>>,acc), do: slugify(rest,[?-|acc])

  defp gen_my_htmlcss(export) do
    write_log("web/#{Mix.Project.config[:webflow].project}.webflow/css/#{Mix.Project.config[:webflow].project}.webflow.css",export["css"])
    for %{"html"=>html,"page"=>%{"slug"=>_slug,"_id"=>id_page}=_page,"renderData"=>%{"hrefMap"=>titles}}<-export["pages"] do
      title = titles[id_page]
      write_log("web/#{Mix.Project.config[:webflow].project}.webflow/#{title}.html",format_html(html))
    end
  end

  defp write_log(path,bin) do
    create_file(path,bin, force: true)
  end

  defp format_html(html) do
    tmp_path = "#{System.tmp_dir}/to_tidy.html"
    File.write!(tmp_path,html)
    case System.cmd "tidy", ["-config","web/tidy.conf",tmp_path] do
      {tidy_html,ret} when ret in [0,1]->tidy_html
      {_,127}-> Mix.Shell.IO.error("please install tidy-html5 (brew install tidy-html5|http://www.htacg.org/binaries/binaries/tidy-5.0.0.RC1/tidy-5.0.0-64bit.deb|https://github.com/htacg/tidy-html5/releases/download/5.0.0/tidy-5.0.0-64bit.deb)")
                html
    end
  end
end
