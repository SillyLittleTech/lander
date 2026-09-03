%{
  site_name: "Oops",
  site_description: "SillyLittleTech Error Page",
  date_format: "{WDfull}, {D} {Mshort} {YYYY}",
  base_url: "/",
  author: "SillyLittleTech",
  author_email: "technical@slt.ong",
  plugins: [
    {Serum.Plugins.LiveReloader, only: :dev}
  ]
}
