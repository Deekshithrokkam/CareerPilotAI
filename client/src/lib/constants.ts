export const targetRoles = ["Frontend Developer", "Backend Developer", "Full-Stack Developer"] as const;
export const interviewTypes = ["Technical", "HR", "Mixed"] as const;
export const difficulties = ["Easy", "Medium", "Hard"] as const;
export const questionCounts = [3, 5, 10] as const;

export const topicsByRole = {
  "Frontend Developer": ["HTML", "CSS", "JavaScript", "TypeScript", "React", "API integration", "Browser concepts", "Web performance", "Accessibility"],
  "Backend Developer": ["Node.js", "Express.js", "REST APIs", "Authentication", "Authorization", "SQL", "PostgreSQL", "Database design", "Security", "Error handling"],
  "Full-Stack Developer": ["React", "Node.js", "Express.js", "APIs", "Supabase", "Authentication", "Authorization", "Database relationships", "Deployment", "Git"]
};
