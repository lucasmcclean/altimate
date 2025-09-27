package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/lucasmcclean/altimate/api/server"
)

func main() {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	log.Println("starting altimate...")

	srv := server.New()

	serverErr := make(chan error, 1)
	go func() {
		log.Printf("listening and serving on: %s\n", srv.Addr)
		err := srv.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			serverErr <- err
		}
	}()

	select {
	case <-ctx.Done():
		log.Println("received shutdown signal")

	case err := <-serverErr:
		log.Fatalf("error listening and serving: %v\n", err)
	}

	log.Println("starting shutdown...")

	if !shutdown(srv) {
		os.Exit(1)
	}
}

func shutdown(srv *http.Server) bool {
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("error shutting down http server: %v\n", err)
		return false
	}

	log.Println("http server shut down successfully")
	return true
}
