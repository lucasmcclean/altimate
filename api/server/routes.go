package server

import (
	"net/http"

	"github.com/lucasmcclean/altimate/api/corrections"
)

func registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/{$}", corrections.Handler)
}
