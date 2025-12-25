---
title: "Architecting a High-Performance Formula 1 RESTful API with Node.js and Supabase"
description: Building a production-ready REST API that delivers comprehensive F1 racing data from 2019-2023, featuring advanced querying, PostgreSQL optimization, and automated deployment workflows.
date: 2025-04-23
image: https://images.pexels.com/photos/1050312/pexels-photo-1050312.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 8
author: 
  name: Amardeep Dhillon
  avatar: 
    src: https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
    alt: Amardeep Dhillon
---

## Introduction

Formula 1 racing generates massive amounts of data—from lap times and qualifying sessions to championship standings and constructor performance. While this data exists, accessing it programmatically in a structured, performant manner has traditionally been challenging.  Enter the **Formula 1 Racing API**:  a production-grade RESTful service built with Node.js and Supabase that delivers five years of comprehensive F1 data through intuitive, lightning-fast endpoints.

This project demonstrates how modern backend technologies can transform raw racing data into an accessible, scalable API platform capable of serving everything from mobile applications to data visualization dashboards.

**Live API:** [https://comp4513assignment1.adhillon.net](https://comp4513assignment1.adhillon.net)

## The Challenge

Building a sports data API presents unique technical challenges:

- **Complex relational data** spanning drivers, constructors, circuits, races, results, qualifying sessions, and standings
- **Performance requirements** for queries across multiple seasons and race events
- **Flexible filtering** by driver names, circuit locations, season ranges, and race rounds
- **Production reliability** with proper error handling and consistent response formats
- **Cost-effective hosting** while maintaining 24/7 availability

The solution needed to balance query flexibility with response speed, all while remaining maintainable and extensible for future enhancements.

## Technical Architecture

### Backend Stack

The API is built on a carefully selected technology stack:

- **Node.js (v18+)** - Non-blocking I/O for high-throughput request handling
- **Express.js** - Minimalist web framework with robust middleware ecosystem
- **Supabase (PostgreSQL)** - Cloud-hosted relational database with built-in security
- **Render** - Platform-as-a-Service for zero-downtime deployments
- **GitHub Actions** - CI/CD automation for keep-alive mechanisms

This combination provides enterprise-level capabilities without the complexity of managing dedicated infrastructure.

### Database Design

The API interfaces with a normalized PostgreSQL database through Supabase, consisting of eight primary tables:

```
circuits                 → Race track information (location, country, URL)
constructors            → Team data (name, nationality, references)
drivers                 → Driver profiles (name, number, nationality, DOB)
races                   → Race events (season, round, circuit, date, time)
results                 → Race finish results (position, points, status)
qualifying              → Qualifying session times (Q1, Q2, Q3)
driver_standings        → Championship points by race
constructor_standings   → Constructor championship points
```

The schema leverages foreign keys to maintain referential integrity while enabling efficient joins for complex queries involving multiple entities.

### Security Model

Security is implemented through **Supabase Row Level Security (RLS)** with: 

- Read-only public policies on all tables
- Environment-based credential management
- CORS configuration for controlled cross-origin access
- No write operations exposed via the API
- API key authentication for Supabase client connections

This ensures data integrity while allowing unrestricted read access for public consumption.

## API Design Philosophy

### RESTful Resource Modeling

The API follows REST principles with hierarchical resource structures:

```
/api/circuits              - Collection of all circuits
/api/circuits/:ref         - Individual circuit by reference ID
/api/drivers               - All drivers across all seasons
/api/drivers/:ref          - Specific driver details
/api/drivers/search/: q     - Fuzzy search by surname
/api/races/season/:year    - All races in a given season
/api/results/:raceId       - Complete race results
```

This design makes endpoint behavior predictable while supporting both broad collection queries and granular filtered requests.

### Advanced Query Patterns

Beyond basic CRUD operations, the API supports sophisticated filtering: 

**Season-Range Filtering:**
```
/api/races/circuits/7/season/2019/2023
→ Returns all races at circuit 7 between 2019-2023
```

**Driver Performance Tracking:**
```
/api/results/drivers/verstappen/seasons/2021/2022
→ Verstappen's results across 2021-2022 seasons
```

**Round-Specific Queries:**
```
/api/races/season/2022/5
→ Returns details for the 5th race of 2022 season
```

These patterns enable front-end applications to build complex data visualizations without multiple API calls.

### Response Format Standardization

All successful responses return JSON arrays or objects: 

```json
{
  "circuitId": 7,
  "circuitRef": "monaco",
  "name": "Circuit de Monaco",
  "location":  "Monte-Carlo",
  "country": "Monaco",
  "lat": 43.7347,
  "lng": 7.42056,
  "url": "http://en.wikipedia.org/wiki/Circuit_de_Monaco"
}
```

Error responses use consistent HTTP status codes with descriptive messages:

```json
{
  "error": "Driver not found"
}
```

This consistency simplifies client-side error handling and improves developer experience.

## Performance Optimizations

### Database Query Efficiency

Several strategies ensure sub-second response times:

1. **Indexed lookups** on frequently queried fields (circuitRef, driverRef, season)
2. **Select projection** to return only necessary columns
3. **Filtered queries** pushed to database level rather than application filtering
4. **Connection pooling** via Supabase client to reduce handshake overhead

Example query optimization: 

```javascript
// Inefficient:  Fetch all then filter in Node.js
const allRaces = await supabase. from('races').select('*');
const filtered = allRaces.filter(r => r.year === 2022);

// Optimized: Filter at database level
const { data } = await supabase
  . from('races')
  .select('*')
  .eq('year', 2022);
```

This approach reduces payload sizes and leverages PostgreSQL's query optimizer.

### Middleware Stack

Express middleware is configured for optimal request handling:

```javascript
app.use(cors());                    // CORS headers for browser requests
app.use(express.json());            // JSON body parsing
app.use(express. static('public'));  // Static asset serving
```

Minimal middleware reduces processing overhead while maintaining necessary functionality.

## Deployment Strategy

### Render Platform Integration

The API deploys to Render with zero-downtime updates:

- **Automatic deployments** triggered by GitHub pushes to main branch
- **Environment variable injection** for Supabase credentials
- **Custom domain support** with SSL certificates
- **Health check endpoints** for monitoring

Build configuration:

```yaml
Build Command: npm install
Start Command: npm start
Runtime: Node 18
```

### The "Cold Start" Problem

Free-tier hosting introduces a unique challenge:  services sleep after 15 minutes of inactivity, causing the first request to take 30-60 seconds while the container spins up. 

**Solution:  Automated Keep-Alive System**

I implemented a multi-layered approach:

1. **Supabase Edge Function** (Deno-based) that pings the API
2. **GitHub Actions workflow** triggering the edge function every 4 days
3. **Scheduled cron job** ensuring the API receives traffic before sleeping

```yaml
# .github/workflows/keep-supabase-alive.yml
name: Keep API Alive
on:
  schedule:
    - cron: '0 0 */4 * *'  # Every 4 days at midnight UTC
jobs:
  ping: 
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Edge Function
        run: |
          curl -X GET "${{ secrets.SUPABASE_URL }}/functions/v1/keep-alive" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_KEY }}"
```

This system maintains API responsiveness without manual intervention.

## Implementation Highlights

### Dynamic Endpoint Construction

The `server.js` file uses Express routing patterns to create flexible endpoints:

```javascript
// Search drivers by surname prefix
app.get('/api/drivers/search/:substring', async (req, res) => {
  const { substring } = req.params;
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .ilike('surname', `${substring}%`);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
```

The `ilike` operator provides case-insensitive prefix matching, enabling user-friendly search functionality.

### Complex Join Queries

Race results require joining multiple tables:

```javascript
app.get('/api/results/:raceId', async (req, res) => {
  const { data, error } = await supabase
    .from('results')
    .select(`
      *,
      drivers: driverId(*),
      constructors:constructorId(*),
      races:raceId(*)
    `)
    .eq('raceId', req. params.raceId)
    .order('position', { ascending: true });
  
  res.json(data);
});
```

Supabase's foreign key traversal syntax enables denormalized responses without manual joins.

### Error Handling Patterns

Consistent error handling across all endpoints:

```javascript
try {
  const { data, error } = await supabase. from('races').select('*');
  
  if (error) throw error;
  if (! data || data.length === 0) {
    return res.status(404).json({ error: 'No races found' });
  }
  
  res.json(data);
} catch (err) {
  res.status(500).json({ error: err.message });
}
```

This pattern ensures clients receive actionable error information while logging issues server-side.

## Data Coverage and Limitations

### Comprehensive 2019-2023 Data

The API provides complete coverage for recent F1 seasons:

- **23 circuits** across 5 continents
- **70+ drivers** with detailed profiles
- **10 constructors** with historical data
- **100+ races** with complete results
- **Qualifying sessions** and championship standings

### Known Limitations

Transparency about data constraints:

- Pre-2019 data may be incomplete or unavailable
- Qualifying results only include drivers who advanced through rounds
- Sprint race formats may have inconsistent data structures
- Real-time data not supported (historical data only)

Documenting these limitations helps users understand API boundaries and plan accordingly.

## API Documentation

Comprehensive documentation includes working examples for every endpoint:

| Endpoint | Example | Description |
|----------|---------|-------------|
| `/api/circuits` | [View Response](https://comp4513assignment1.adhillon.net/api/circuits) | All race circuits |
| `/api/drivers/Norris` | [View Response](https://comp4513assignment1.adhillon.net/api/drivers/Norris) | Lando Norris details |
| `/api/races/season/2022` | [View Response](https://comp4513assignment1.adhillon. net/api/races/season/2022) | 2022 race calendar |
| `/api/results/driver/max_verstappen` | [View Response](https://comp4513assignment1.adhillon. net/api/results/driver/max_verstappen) | Verstappen's results |

Live links in documentation reduce friction for developers integrating with the API.

## Lessons Learned

### Database-First Design

Starting with a well-normalized database schema simplified API development.  Many complex queries became simple SELECT statements rather than application-level data manipulation.

### Environment Configuration

Using `.env` files with `dotenv` kept credentials out of version control while enabling seamless local development and production deployment.

### The Value of Live Examples

Including working endpoint examples in the README dramatically improved developer experience—no need to guess at response formats or valid parameter values.

### Automation Saves Time

The GitHub Actions keep-alive workflow eliminates manual intervention, proving that small automation investments pay ongoing dividends.

## Future Enhancements

The roadmap includes several advanced features:

- **GraphQL endpoint** for flexible client-driven queries
- **WebSocket support** for real-time race updates (when live data becomes available)
- **Rate limiting** to prevent abuse and ensure fair usage
- **Caching layer** with Redis for frequently accessed data
- **API key authentication** for usage analytics and tiered access
- **Pagination** for large result sets
- **Expanded data coverage** to include earlier F1 seasons
- **Statistical endpoints** for aggregated metrics (averages, win rates, etc.)

## Use Cases

This API enables various applications:

- **Mobile apps** displaying race calendars and live standings
- **Data visualization dashboards** showing driver/constructor performance trends
- **Fantasy F1 platforms** pulling historical performance data
- **Educational projects** teaching REST API consumption
- **Historical analysis tools** for motorsport researchers

## Conclusion

Building the Formula 1 Racing API was an exercise in backend fundamentals—relational database design, RESTful API architecture, cloud deployment, and production DevOps practices. The project demonstrates that with the right tool selection (Node.js + Express + Supabase), even complex data services can be built and deployed efficiently.

The combination of PostgreSQL's powerful querying capabilities, Supabase's developer-friendly abstractions, and Render's seamless deployment creates a stack that scales from prototype to production without major refactoring.

Whether you're building your first API or your fiftieth, the principles remain constant: design clear resource models, optimize database queries early, document thoroughly, and automate operational tasks whenever possible. 

The complete source code and detailed endpoint documentation are available on [GitHub](https://github.com/adhillon192/Formula1_RacingAPI). Feel free to fork, extend, or use it as a reference for your own API projects.

---

**Tech Stack:** Node.js 18 | Express.js | Supabase (PostgreSQL) | Render | GitHub Actions

**Live API:** [comp4513assignment1.adhillon. net](https://comp4513assignment1.adhillon.net)

**Source Code:** [GitHub Repository](https://github.com/adhillon192/Formula1_RacingAPI)

**API Documentation:** [View All Endpoints](https://comp4513assignment1.adhillon.net/)