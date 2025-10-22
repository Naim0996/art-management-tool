package ratelimit

import (
	"sync"
	"time"
)

// Limiter implements a token bucket rate limiter
type Limiter struct {
	mu         sync.Mutex
	rate       int           // tokens per window
	window     time.Duration // time window
	tokens     int           // current available tokens
	lastRefill time.Time     // last time tokens were refilled
}

// NewLimiter creates a new rate limiter
// rate: number of requests allowed per window
// window: time duration for the rate limit window
func NewLimiter(rate int, window time.Duration) *Limiter {
	return &Limiter{
		rate:       rate,
		window:     window,
		tokens:     rate,
		lastRefill: time.Now(),
	}
}

// Allow checks if a request is allowed under the rate limit
// Returns true if allowed, false if rate limit exceeded
func (l *Limiter) Allow() bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	
	// Refill tokens if window has passed
	now := time.Now()
	if now.Sub(l.lastRefill) >= l.window {
		l.tokens = l.rate
		l.lastRefill = now
	}
	
	// Check if tokens available
	if l.tokens > 0 {
		l.tokens--
		return true
	}
	
	return false
}

// Remaining returns the number of remaining tokens
func (l *Limiter) Remaining() int {
	l.mu.Lock()
	defer l.mu.Unlock()
	
	// Update tokens if window has passed
	now := time.Now()
	if now.Sub(l.lastRefill) >= l.window {
		l.tokens = l.rate
		l.lastRefill = now
	}
	
	return l.tokens
}

// ResetAt returns the time when the rate limit will reset
func (l *Limiter) ResetAt() time.Time {
	l.mu.Lock()
	defer l.mu.Unlock()
	
	return l.lastRefill.Add(l.window)
}

// Wait blocks until a request can be made within the rate limit
func (l *Limiter) Wait() {
	for !l.Allow() {
		resetAt := l.ResetAt()
		waitTime := time.Until(resetAt)
		if waitTime > 0 {
			time.Sleep(waitTime)
		}
	}
}

// Manager manages multiple rate limiters by key
type Manager struct {
	mu       sync.RWMutex
	limiters map[string]*Limiter
	rate     int
	window   time.Duration
}

// NewManager creates a new rate limiter manager
func NewManager(rate int, window time.Duration) *Manager {
	return &Manager{
		limiters: make(map[string]*Limiter),
		rate:     rate,
		window:   window,
	}
}

// GetLimiter gets or creates a rate limiter for a specific key
func (m *Manager) GetLimiter(key string) *Limiter {
	m.mu.RLock()
	limiter, exists := m.limiters[key]
	m.mu.RUnlock()
	
	if exists {
		return limiter
	}
	
	// Create new limiter
	m.mu.Lock()
	defer m.mu.Unlock()
	
	// Double-check after acquiring write lock
	limiter, exists = m.limiters[key]
	if exists {
		return limiter
	}
	
	limiter = NewLimiter(m.rate, m.window)
	m.limiters[key] = limiter
	return limiter
}

// Allow checks if a request is allowed for a specific key
func (m *Manager) Allow(key string) bool {
	limiter := m.GetLimiter(key)
	return limiter.Allow()
}

// Remaining returns the remaining tokens for a specific key
func (m *Manager) Remaining(key string) int {
	limiter := m.GetLimiter(key)
	return limiter.Remaining()
}

// ResetAt returns when the rate limit will reset for a specific key
func (m *Manager) ResetAt(key string) time.Time {
	limiter := m.GetLimiter(key)
	return limiter.ResetAt()
}

// Cleanup removes inactive limiters (those that haven't been used recently)
func (m *Manager) Cleanup(inactiveDuration time.Duration) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	now := time.Now()
	for key, limiter := range m.limiters {
		if now.Sub(limiter.lastRefill) > inactiveDuration {
			delete(m.limiters, key)
		}
	}
}
