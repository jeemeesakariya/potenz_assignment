const roles = [
  ['Node.js Developer', 'Build reliable REST APIs and background services using Node.js, Express, and MongoDB.'],
  ['Frontend Engineer', 'Create accessible, responsive interfaces with modern JavaScript and component-based UI patterns.'],
  ['Full Stack Developer', 'Deliver customer-facing features across web clients, APIs, and data stores.'],
  ['QA Automation Engineer', 'Develop maintainable automated tests for web applications, APIs, and deployment pipelines.'],
  ['DevOps Engineer', 'Improve CI/CD workflows, observability, infrastructure automation, and service reliability.'],
  ['Data Analyst', 'Turn product and business data into trusted dashboards, metrics, and actionable insights.'],
  ['Product Designer', 'Research user needs and create accessible product flows, prototypes, and design systems.'],
  ['Mobile Developer', 'Build polished mobile experiences with robust networking, testing, and release practices.'],
  ['Cloud Engineer', 'Design secure cloud infrastructure and help teams operate scalable production services.'],
  ['Security Engineer', 'Assess application risks and implement practical controls across software delivery systems.'],
];

const companies = [
  'Potenz Technologies', 'BrightLabs', 'QualityWorks', 'NovaStack', 'CloudCraft',
  'DataBridge', 'PixelForge', 'SecureLayer', 'GreenByte', 'Orbit Systems',
];
const locations = [
  'Remote', 'Bengaluru, India', 'Hyderabad, India', 'Pune, India', 'Mumbai, India',
  'Chennai, India', 'Delhi NCR, India', 'Kochi, India', 'Ahmedabad, India', 'Jaipur, India',
];
const levels = ['Junior', 'Associate', 'Mid-level', 'Senior'];
const employmentTypes = ['Full-time', 'Full-time', 'Full-time', 'Contract', 'Internship'];

module.exports = Array.from({ length: 200 }, (_, index) => {
  const [role, summary] = roles[index % roles.length];
  const level = levels[Math.floor(index / roles.length) % levels.length];
  const company = companies[Math.floor(index / 4) % companies.length];
  return {
    seedKey: `demo-job-${String(index + 1).padStart(3, '0')}`,
    title: `${level} ${role}`,
    company,
    location: locations[(index * 3) % locations.length],
    employmentType: employmentTypes[index % employmentTypes.length],
    description: `${summary} You will collaborate with engineering, product, and operations teams, review quality metrics, document decisions, and continuously improve delivery. This realistic demonstration vacancy is suitable for testing search, pagination, and application workflows.`,
    isActive: index % 17 !== 0,
  };
});
