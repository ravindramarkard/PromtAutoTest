const cron = require('node-cron');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const testSuiteService = require('./testSuiteService');

class SchedulerService {
  constructor() {
    this.scheduledJobs = new Map();
    this.schedulesFile = path.join(__dirname, '../data/schedules.json');
    this.loadSchedules();
  }

  // Load existing schedules from file
  async loadSchedules() {
    try {
      if (await fs.pathExists(this.schedulesFile)) {
        const schedules = await fs.readJson(this.schedulesFile);
        
        // Restore active schedules
        for (const schedule of schedules) {
          if (schedule.active) {
            this.createCronJob(schedule);
          }
        }
        
        console.log(`📅 Loaded ${schedules.filter(s => s.active).length} active schedules`);
      }
    } catch (error) {
      console.error('❌ Error loading schedules:', error);
    }
  }

  // Save schedules to file
  async saveSchedules() {
    try {
      const schedules = Array.from(this.scheduledJobs.values()).map(job => job.schedule);
      await fs.ensureDir(path.dirname(this.schedulesFile));
      await fs.writeJson(this.schedulesFile, schedules, { spaces: 2 });
    } catch (error) {
      console.error('❌ Error saving schedules:', error);
    }
  }

  // Create a new scheduled job
  async createSchedule(scheduleData) {
    const schedule = {
      id: uuidv4(),
      name: scheduleData.name,
      description: scheduleData.description || '',
      type: scheduleData.type, // 'suite' or 'collection'
      targetId: scheduleData.targetId, // suite ID or collection ID
      targetName: scheduleData.targetName,
      cronExpression: scheduleData.cronExpression,
      timezone: scheduleData.timezone || 'UTC',
      executionOptions: {
        headless: scheduleData.executionOptions?.headless !== false,
        browser: scheduleData.executionOptions?.browser || 'chromium',
        parallel: scheduleData.executionOptions?.parallel || false,
        environment: scheduleData.executionOptions?.environment,
        tags: scheduleData.executionOptions?.tags || []
      },
      active: true,
      createdAt: new Date().toISOString(),
      lastRun: null,
      nextRun: null,
      runCount: 0,
      notifications: scheduleData.notifications || {
        onSuccess: false,
        onFailure: true,
        email: null
      }
    };

    // Validate cron expression
    if (!cron.validate(schedule.cronExpression)) {
      throw new Error('Invalid cron expression');
    }

    // Create the cron job
    this.createCronJob(schedule);
    
    // Save to file
    await this.saveSchedules();
    
    console.log(`📅 Created schedule: ${schedule.name} (${schedule.cronExpression})`);
    return schedule;
  }

  // Create actual cron job
  createCronJob(schedule) {
    const task = cron.schedule(schedule.cronExpression, async () => {
      await this.executeScheduledJob(schedule);
    }, {
      scheduled: false,
      timezone: schedule.timezone
    });

    // Calculate next run time
    schedule.nextRun = this.getNextRunTime(schedule.cronExpression, schedule.timezone);

    const jobData = {
      schedule,
      task,
      createdAt: new Date().toISOString()
    };

    this.scheduledJobs.set(schedule.id, jobData);
    
    if (schedule.active) {
      task.start();
    }
  }

  // Execute a scheduled job
  async executeScheduledJob(schedule) {
    try {
      console.log(`🚀 Executing scheduled job: ${schedule.name}`);
      
      const startTime = new Date();
      let result;

      if (schedule.type === 'suite') {
        result = await testSuiteService.runTestSuite(schedule.targetId, schedule.executionOptions);
      } else if (schedule.type === 'collection') {
        result = await testSuiteService.runTestCollection(schedule.targetId, schedule.executionOptions);
      } else {
        throw new Error(`Unknown schedule type: ${schedule.type}`);
      }

      const endTime = new Date();
      const duration = endTime - startTime;

      // Update schedule metadata
      schedule.lastRun = startTime.toISOString();
      schedule.runCount++;
      schedule.nextRun = this.getNextRunTime(schedule.cronExpression, schedule.timezone);

      // Log execution
      const execution = {
        id: uuidv4(),
        scheduleId: schedule.id,
        scheduleName: schedule.name,
        type: schedule.type,
        targetId: schedule.targetId,
        targetName: schedule.targetName,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        success: result.success || false,
        result,
        executionOptions: schedule.executionOptions
      };

      await this.logExecution(execution);
      await this.saveSchedules();

      console.log(`✅ Scheduled job completed: ${schedule.name} (${duration}ms)`);

      // Handle notifications
      if (schedule.notifications) {
        await this.handleNotifications(schedule, execution);
      }

    } catch (error) {
      console.error(`❌ Scheduled job failed: ${schedule.name}`, error);
      
      // Log failed execution
      const execution = {
        id: uuidv4(),
        scheduleId: schedule.id,
        scheduleName: schedule.name,
        type: schedule.type,
        targetId: schedule.targetId,
        targetName: schedule.targetName,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 0,
        success: false,
        error: error.message,
        executionOptions: schedule.executionOptions
      };

      await this.logExecution(execution);

      // Handle failure notifications
      if (schedule.notifications && schedule.notifications.onFailure) {
        await this.handleNotifications(schedule, execution);
      }
    }
  }

  // Get next run time for a cron expression
  getNextRunTime(cronExpression, timezone = 'UTC') {
    try {
      const task = cron.schedule(cronExpression, () => {}, {
        scheduled: false,
        timezone
      });
      
      // This is a simplified calculation - in a real implementation,
      // you'd use a proper cron parser library
      const now = new Date();
      const nextRun = new Date(now.getTime() + 60000); // Placeholder: next minute
      return nextRun.toISOString();
    } catch (error) {
      return null;
    }
  }

  // Log execution to file
  async logExecution(execution) {
    try {
      const executionsFile = path.join(__dirname, '../data/schedule-executions.json');
      let executions = [];
      
      if (await fs.pathExists(executionsFile)) {
        executions = await fs.readJson(executionsFile);
      }
      
      executions.unshift(execution); // Add to beginning
      
      // Keep only last 1000 executions
      if (executions.length > 1000) {
        executions = executions.slice(0, 1000);
      }
      
      await fs.ensureDir(path.dirname(executionsFile));
      await fs.writeJson(executionsFile, executions, { spaces: 2 });
    } catch (error) {
      console.error('❌ Error logging execution:', error);
    }
  }

  // Handle notifications (placeholder for future email/webhook integration)
  async handleNotifications(schedule, execution) {
    try {
      if (execution.success && schedule.notifications.onSuccess) {
        console.log(`📧 Success notification for: ${schedule.name}`);
        // TODO: Implement email/webhook notifications
      } else if (!execution.success && schedule.notifications.onFailure) {
        console.log(`📧 Failure notification for: ${schedule.name}`);
        // TODO: Implement email/webhook notifications
      }
    } catch (error) {
      console.error('❌ Error sending notifications:', error);
    }
  }

  // Get all schedules
  async getSchedules() {
    return Array.from(this.scheduledJobs.values()).map(job => job.schedule);
  }

  // Get specific schedule
  async getSchedule(scheduleId) {
    const job = this.scheduledJobs.get(scheduleId);
    return job ? job.schedule : null;
  }

  // Update schedule
  async updateSchedule(scheduleId, updateData) {
    const job = this.scheduledJobs.get(scheduleId);
    if (!job) {
      throw new Error('Schedule not found');
    }

    const schedule = job.schedule;
    
    // Stop current job
    job.task.stop();
    
    // Update schedule data
    Object.assign(schedule, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    // Validate new cron expression if changed
    if (updateData.cronExpression && !cron.validate(schedule.cronExpression)) {
      throw new Error('Invalid cron expression');
    }

    // Recreate job with new settings
    this.scheduledJobs.delete(scheduleId);
    this.createCronJob(schedule);
    
    await this.saveSchedules();
    
    console.log(`📅 Updated schedule: ${schedule.name}`);
    return schedule;
  }

  // Delete schedule
  async deleteSchedule(scheduleId) {
    const job = this.scheduledJobs.get(scheduleId);
    if (!job) {
      return false;
    }

    // Stop and remove the job
    job.task.stop();
    this.scheduledJobs.delete(scheduleId);
    
    await this.saveSchedules();
    
    console.log(`📅 Deleted schedule: ${job.schedule.name}`);
    return true;
  }

  // Toggle schedule active state
  async toggleSchedule(scheduleId, active) {
    const job = this.scheduledJobs.get(scheduleId);
    if (!job) {
      throw new Error('Schedule not found');
    }

    job.schedule.active = active;
    
    if (active) {
      job.task.start();
      job.schedule.nextRun = this.getNextRunTime(job.schedule.cronExpression, job.schedule.timezone);
    } else {
      job.task.stop();
      job.schedule.nextRun = null;
    }
    
    await this.saveSchedules();
    
    console.log(`📅 ${active ? 'Activated' : 'Deactivated'} schedule: ${job.schedule.name}`);
    return job.schedule;
  }

  // Get execution history
  async getExecutionHistory(scheduleId = null, limit = 50) {
    try {
      const executionsFile = path.join(__dirname, '../data/schedule-executions.json');
      
      if (!(await fs.pathExists(executionsFile))) {
        return [];
      }
      
      let executions = await fs.readJson(executionsFile);
      
      if (scheduleId) {
        executions = executions.filter(exec => exec.scheduleId === scheduleId);
      }
      
      return executions.slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting execution history:', error);
      return [];
    }
  }

  // Get schedule statistics
  async getScheduleStatistics() {
    try {
      const schedules = await this.getSchedules();
      const executions = await this.getExecutionHistory();
      
      const stats = {
        totalSchedules: schedules.length,
        activeSchedules: schedules.filter(s => s.active).length,
        inactiveSchedules: schedules.filter(s => !s.active).length,
        totalExecutions: executions.length,
        successfulExecutions: executions.filter(e => e.success).length,
        failedExecutions: executions.filter(e => !e.success).length,
        recentExecutions: executions.slice(0, 10),
        schedulesByType: {
          suite: schedules.filter(s => s.type === 'suite').length,
          collection: schedules.filter(s => s.type === 'collection').length
        }
      };
      
      return stats;
    } catch (error) {
      console.error('❌ Error getting schedule statistics:', error);
      return {
        totalSchedules: 0,
        activeSchedules: 0,
        inactiveSchedules: 0,
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        recentExecutions: [],
        schedulesByType: { suite: 0, collection: 0 }
      };
    }
  }

  // Validate cron expression and get human readable description
  validateCronExpression(cronExpression) {
    if (!cron.validate(cronExpression)) {
      return { valid: false, description: 'Invalid cron expression' };
    }

    // Basic cron descriptions (you could use a library like cronstrue for better descriptions)
    const descriptions = {
      '0 0 * * *': 'Daily at midnight',
      '0 9 * * *': 'Daily at 9:00 AM',
      '0 18 * * *': 'Daily at 6:00 PM',
      '0 9 * * 1': 'Every Monday at 9:00 AM',
      '0 9 * * 1-5': 'Weekdays at 9:00 AM',
      '0 */6 * * *': 'Every 6 hours',
      '*/30 * * * *': 'Every 30 minutes',
      '0 0 1 * *': 'Monthly on the 1st at midnight'
    };

    return {
      valid: true,
      description: descriptions[cronExpression] || 'Custom schedule'
    };
  }
}

// Create singleton instance
const schedulerService = new SchedulerService();

module.exports = schedulerService;