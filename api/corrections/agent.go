package corrections

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"slices"

	"github.com/lucasmcclean/adk-go/agent"
	"github.com/lucasmcclean/adk-go/session"
	"github.com/lucasmcclean/adk-go/types"
	"google.golang.org/genai"
)

const defaultModel = "gemini-2.0-flash-lite"

type CheckType int

const (
	ImgAlt         = "img_alt"
	ImgContrast    = "img_contrast"
	PageContrast   = "page_contrast"
	PageNavigation = "page_navigation"
	PageSkipToMain = "page_skip_to_main"
)

type AltimateRequest struct {
	HTML            string      `json:"html"`
	RequestedChecks []CheckType `json:"requestedChecks"`
}

type AccessibilityCorrection struct {
	ChangeType      string `json:"changeType"`
	QuerySelector   string `json:"querySelector"`
	ReplacementHTML string `json:"replacementHTML"`
	Connections     []int  `json:"connections"`
	DescriptionText string `json:"descriptionText"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	if r.Method == http.MethodOptions {
		return
	}

	var req AltimateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Printf("%v", r)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	agent, err := NewCorrectionsAgent(ctx, req.RequestedChecks)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	html := genai.NewContentFromText(req.HTML, genai.RoleUser)

	sessionService := session.NewInMemoryService()
	sess, _ := sessionService.CreateSession(ctx, "altimate", "api_user", "api_session", nil)
	ictx := types.NewInvocationContext(agent, sess, sessionService, types.WithUserContent(html))

	var corrections []AccessibilityCorrection

	for event, err := range agent.Run(ctx, ictx) {
		if err != nil {
			log.Printf("Error from agent: %v", err)
			continue
		}

		output := event.GetText()
		if output == "" {
			continue
		}

		var partialCorrections []AccessibilityCorrection
		if err := json.Unmarshal([]byte(output), &partialCorrections); err != nil {
			log.Printf("Failed to parse output JSON: %v", err)
			continue
		}

		corrections = append(corrections, partialCorrections...)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(corrections)
}

func NewCorrectionsAgent(ctx context.Context, checkTypes []CheckType) (*agent.ParallelAgent, error) {
	imgAltAgent, err := agent.NewLLMAgent(ctx, "imgAltAgent", agent.WithModelString(defaultModel), agent.WithInstruction(`
        You are an accessibility agent that analyzes an HTML+CSS website and identifies
        accessibility issues. For each issue you find, return a correction as a JSON
        object in a list.

        Each correction must include:

        {
            "changeType": Enum[
                "img_alt_added",
                "img_alt_altered"
            ],
            "querySelector": string,      // CSS selector targeting the affected node
            "replacementHTML": string,    // The full replacement HTML element
            "connections": array[int],    // Indexes of related nodes in the input
            "descriptionText": string     // Explanation of the issue and recommended fix
        }

        Your job is to:
        - Analyze the given HTML for accessibility problems related to the supported
            change types.
        - Propose minimal, semantic HTML corrections that improve accessibility.
        - Return only the list of JSON objects; no additional explanation or comments.`,
	),
	)
	if err != nil {
		return nil, err
	}

	imgContrastAgent, err := agent.NewLLMAgent(ctx, "imgContrastAgent", agent.WithModelString(defaultModel), agent.WithInstruction(`
        You are an accessibility agent that analyzes an HTML+CSS website and identifies
        accessibility issues. For each issue you find, return a correction as a JSON
        object in a list.

        Each correction must include:

        {
            "changeType": "img_contrast_altered",
            "querySelector": string,      // CSS selector targeting the affected node
            "replacementHTML": string,    // The full replacement HTML element
            "connections": array[int],    // Indexes of related nodes in the input
            "descriptionText": string     // Explanation of the issue and recommended fix
        }

        Your job is to:
        - Analyze the given HTML for accessibility problems related to the supported
            change types.
        - Propose minimal, semantic HTML corrections that improve accessibility.
        - Return only the list of JSON objects; no additional explanation or comments.`,
	),
	)
	if err != nil {
		return nil, err
	}

	pageContrastAgent, err := agent.NewLLMAgent(ctx, "pageContrastAgent", agent.WithModelString(defaultModel), agent.WithInstruction(`
        You are an accessibility agent that analyzes an HTML+CSS website and identifies
        accessibility issues. For each issue you find, return a correction as a JSON
        object in a list.

        Each correction must include:

        {
            "changeType": "page_contrast_altered",
            "querySelector": string,      // CSS selector targeting the affected node
            "replacementHTML": string,    // The full replacement HTML element
            "connections": array[int],    // Indexes of related nodes in the input
            "descriptionText": string     // Explanation of the issue and recommended fix
        }

        Your job is to:
        - Analyze the given HTML for accessibility problems related to the supported
            change types.
        - Propose minimal, semantic HTML corrections that improve accessibility.
        - Return only the list of JSON objects; no additional explanation or comments.`,
	),
	)
	if err != nil {
		return nil, err
	}

	pageNavigationAgent, err := agent.NewLLMAgent(ctx, "pageNavigationAgent", agent.WithModelString(defaultModel), agent.WithInstruction(`
        You are an accessibility agent that analyzes an HTML+CSS website and identifies
        accessibility issues. For each issue you find, return a correction as a JSON
        object in a list.

        Each correction must include:

        {
            "changeType": "page_navigation_altered",
            "querySelector": string,      // CSS selector targeting the affected node
            "replacementHTML": string,    // The full replacement HTML element
            "connections": array[int],    // Indexes of related nodes in the input
            "descriptionText": string     // Explanation of the issue and recommended fix
        }

        Your job is to:
        - Analyze the given HTML for accessibility problems related to the supported
            change types.
        - Propose minimal, semantic HTML corrections that improve accessibility.
        - Return only the list of JSON objects; no additional explanation or comments.`,
	),
	)
	if err != nil {
		return nil, err
	}

	pageSkipToMainAgent, err := agent.NewLLMAgent(ctx, "pageSkipToMainAgent", agent.WithModelString(defaultModel), agent.WithInstruction(`
        You are an accessibility agent that analyzes an HTML+CSS website and identifies
        accessibility issues. For each issue you find, return a correction as a JSON
        object in a list.

        Each correction must include:

        {
            "changeType": "page_skip_to_main_added",
            "querySelector": string,      // CSS selector targeting the affected node
            "replacementHTML": string,    // The full replacement HTML element
            "connections": array[int],    // Indexes of related nodes in the input
            "descriptionText": string     // Explanation of the issue and recommended fix
        }

        Your job is to:
        - Analyze the given HTML for accessibility problems related to the supported
            change types.
        - Propose minimal, semantic HTML corrections that improve accessibility.
        - Return only the list of JSON objects; no additional explanation or comments.`,
	),
	)
	if err != nil {
		return nil, err
	}

	subAgents := []types.Agent{}

	if slices.Contains(checkTypes, ImgAlt) {
		subAgents = append(subAgents, imgAltAgent)
	}
	if slices.Contains(checkTypes, ImgContrast) {
		subAgents = append(subAgents, imgContrastAgent)
	}
	if slices.Contains(checkTypes, PageContrast) {
		subAgents = append(subAgents, pageContrastAgent)
	}
	if slices.Contains(checkTypes, PageNavigation) {
		subAgents = append(subAgents, pageNavigationAgent)
	}
	if slices.Contains(checkTypes, PageSkipToMain) {
		subAgents = append(subAgents, pageSkipToMainAgent)
	}

	return agent.NewParallelAgent("correctionsSubAgentsManager", subAgents...), nil
}
