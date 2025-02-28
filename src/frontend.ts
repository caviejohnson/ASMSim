Bun.serve(
    routes: {
        "/": (req) => {
            return new Response(Bun.file("frontend.html"))
        }
    }
)