package scheduler

import (
	"context"
	"log"
	"sync"
	"time"
)

// Job represents a scheduled job
type Job struct {
	Name     string
	Interval time.Duration
	Task     func(context.Context) error
	lastRun  time.Time
	enabled  bool
}

// Scheduler manages scheduled background jobs
type Scheduler struct {
	mu      sync.RWMutex
	jobs    map[string]*Job
	ctx     context.Context
	cancel  context.CancelFunc
	wg      sync.WaitGroup
	running bool
}

// NewScheduler creates a new scheduler
func NewScheduler() *Scheduler {
	return &Scheduler{
		jobs: make(map[string]*Job),
	}
}

// AddJob adds a new job to the scheduler
func (s *Scheduler) AddJob(name string, interval time.Duration, task func(context.Context) error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	s.jobs[name] = &Job{
		Name:     name,
		Interval: interval,
		Task:     task,
		enabled:  true,
	}
	
	log.Printf("Scheduler: Added job '%s' with interval %s", name, interval)
}

// RemoveJob removes a job from the scheduler
func (s *Scheduler) RemoveJob(name string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	delete(s.jobs, name)
	log.Printf("Scheduler: Removed job '%s'", name)
}

// EnableJob enables a job
func (s *Scheduler) EnableJob(name string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	if job, exists := s.jobs[name]; exists {
		job.enabled = true
		log.Printf("Scheduler: Enabled job '%s'", name)
	}
}

// DisableJob disables a job
func (s *Scheduler) DisableJob(name string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	if job, exists := s.jobs[name]; exists {
		job.enabled = false
		log.Printf("Scheduler: Disabled job '%s'", name)
	}
}

// Start starts the scheduler
func (s *Scheduler) Start() {
	s.mu.Lock()
	if s.running {
		s.mu.Unlock()
		return
	}
	
	s.ctx, s.cancel = context.WithCancel(context.Background())
	s.running = true
	s.mu.Unlock()
	
	log.Println("Scheduler: Starting...")
	
	// Start a goroutine for each job
	s.mu.RLock()
	for _, job := range s.jobs {
		s.wg.Add(1)
		go s.runJob(job)
	}
	s.mu.RUnlock()
	
	log.Println("Scheduler: Started")
}

// Stop stops the scheduler gracefully
func (s *Scheduler) Stop() {
	s.mu.Lock()
	if !s.running {
		s.mu.Unlock()
		return
	}
	s.mu.Unlock()
	
	log.Println("Scheduler: Stopping...")
	
	s.cancel()
	s.wg.Wait()
	
	s.mu.Lock()
	s.running = false
	s.mu.Unlock()
	
	log.Println("Scheduler: Stopped")
}

// runJob runs a single job in a loop
func (s *Scheduler) runJob(job *Job) {
	defer s.wg.Done()
	
	ticker := time.NewTicker(job.Interval)
	defer ticker.Stop()
	
	// Run immediately on start if enabled
	s.executeJob(job)
	
	for {
		select {
		case <-s.ctx.Done():
			return
		case <-ticker.C:
			s.executeJob(job)
		}
	}
}

// executeJob executes a job if it's enabled
func (s *Scheduler) executeJob(job *Job) {
	s.mu.RLock()
	enabled := job.enabled
	s.mu.RUnlock()
	
	if !enabled {
		return
	}
	
	log.Printf("Scheduler: Running job '%s'", job.Name)
	start := time.Now()
	
	err := job.Task(s.ctx)
	
	duration := time.Since(start)
	
	s.mu.Lock()
	job.lastRun = start
	s.mu.Unlock()
	
	if err != nil {
		log.Printf("Scheduler: Job '%s' failed after %s: %v", job.Name, duration, err)
	} else {
		log.Printf("Scheduler: Job '%s' completed successfully in %s", job.Name, duration)
	}
}

// GetJobStatus returns the status of all jobs
func (s *Scheduler) GetJobStatus() map[string]JobStatus {
	s.mu.RLock()
	defer s.mu.RUnlock()
	
	status := make(map[string]JobStatus)
	for name, job := range s.jobs {
		var nextRun time.Time
		if !job.lastRun.IsZero() {
			nextRun = job.lastRun.Add(job.Interval)
		}
		
		status[name] = JobStatus{
			Name:     job.Name,
			Enabled:  job.enabled,
			Interval: job.Interval,
			LastRun:  job.lastRun,
			NextRun:  nextRun,
		}
	}
	
	return status
}

// JobStatus represents the status of a scheduled job
type JobStatus struct {
	Name     string        `json:"name"`
	Enabled  bool          `json:"enabled"`
	Interval time.Duration `json:"interval"`
	LastRun  time.Time     `json:"last_run"`
	NextRun  time.Time     `json:"next_run"`
}
