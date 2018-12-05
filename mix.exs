defmodule Rothschild.MixProject do
  use Mix.Project

  def project do
    [
      app: :rothschild,
      version: "0.1.0",
      elixir: "~> 1.7",
      build_embedded: Mix.env == :prod,
      start_permanent: Mix.env() == :prod,
      webflow: %{project: "rothschildish", login: "___KBRW1", password: "___2mKAsurIgaWebflow"},
      deps: deps(),
      compilers: [:reaxt_webpack] ++ Mix.compilers,
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger,:cowboy,:inets,:reaxt,:eex],
      mod: {Rothschild.Application, []},
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      # {:dep_from_hexpm, "~> 0.3.0"},
      # {:dep_from_git, git: "https://github.com/elixir-lang/my_dep.git", tag: "0.1.0"},
      {:cowboy, "~> 1.1.2", override: true},
      {:plug, "~> 1.3.4"},
      {:poison, "~> 3.1", override: true},
      {:reaxt, "~> 2.0", github: "kbrw/reaxt"},
    ]
  end
end
