const axios = require('axios');
const cheerio = require('cheerio');
const College = require('../models/College');
const Exam = require('../models/Exam');

class DataScraper {
  constructor() {
    this.baseUrls = {
      nirf: 'https://www.nirfindia.org/',
      naac: 'https://www.naac.gov.in/',
      aicte: 'https://www.aicte-india.org/',
      ugc: 'https://www.ugc.ac.in/'
    };
  }

  // Scrape NIRF rankings
  async scrapeNIRFRankings(year = 2023) {
    try {
      const url = `${this.baseUrls.nirf}${year}/Ranking.html`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const rankings = [];

      // Parse ranking table (example selector, adjust based on actual structure)
      $('table tbody tr').each((i, elem) => {
        const rank = $(elem).find('td:nth-child(1)').text().trim();
        const name = $(elem).find('td:nth-child(2)').text().trim();
        const city = $(elem).find('td:nth-child(3)').text().trim();
        const state = $(elem).find('td:nth-child(4)').text().trim();
        const score = $(elem).find('td:nth-child(5)').text().trim();

        rankings.push({
          rank: parseInt(rank),
          name,
          city,
          state,
          score: parseFloat(score)
        });
      });

      return rankings;
    } catch (error) {
      console.error('Error scraping NIRF rankings:', error);
      throw error;
    }
  }

  // Scrape college details from official website
  async scrapeCollegeDetails(collegeName, website) {
    try {
      if (!website) {
        return null;
      }

      const response = await axios.get(website, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);

      // Extract basic information (these selectors are examples)
      const name = $('h1').first().text().trim() || collegeName;
      const address = $('address').text().trim() || $('.address').text().trim();
      const phone = $('.phone, .contact').text().match(/\d{10}/g);
      const email = $('a[href^="mailto:"]').attr('href')?.replace('mailto:', '');

      // Extract courses (look for lists or tables with course names)
      const courses = [];
      $('ul li, .course-list li, table td').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text.match(/b\.?tech|b\.?e\.?|m\.?tech|mba|bca|mca|bsc|msc|bba|mba/gi)) {
          courses.push(text);
        }
      });

      return {
        name,
        address,
        contact: {
          phone: phone || [],
          email: email || ''
        },
        courses: [...new Set(courses)], // Remove duplicates
        website
      };
    } catch (error) {
      console.error(`Error scraping ${collegeName}:`, error.message);
      return null;
    }
  }

  // Scrape exam cutoffs
  async scrapeExamCutoffs(examName, year) {
    try {
      // This would be specific to each exam's official website
      const examUrls = {
        'JEE Main': 'https://jeemain.nta.nic.in/',
        'NEET UG': 'https://neet.nta.nic.in/',
        'CUET': 'https://cuet.samarth.ac.in/'
      };

      const url = examUrls[examName];
      if (!url) {
        return null;
      }

      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Parse cutoff data (structure varies by exam)
      const cutoffs = [];

      // Example: Find cutoff tables
      $('table').each((i, table) => {
        const tableText = $(table).text();
        if (tableText.includes('Cut-off') || tableText.includes('Closing Rank')) {
          $(table).find('tr').each((j, row) => {
            const cols = $(row).find('td');
            if (cols.length >= 3) {
              const institute = $(cols[0]).text().trim();
              const course = $(cols[1]).text().trim();
              const rank = $(cols[2]).text().trim();

              cutoffs.push({
                institute,
                course,
                rank: parseInt(rank),
                exam: examName,
                year
              });
            }
          });
        }
      });

      return cutoffs;
    } catch (error) {
      console.error(`Error scraping ${examName} cutoffs:`, error);
      return null;
    }
  }

  // Update college data with scraped information
  async updateCollegeData(collegeId) {
    try {
      const college = await College.findById(collegeId);
      if (!college || !college.contact.website) {
        return false;
      }

      const scrapedData = await this.scrapeCollegeDetails(college.name, college.contact.website);

      if (scrapedData) {
        // Update college with scraped data
        await College.findByIdAndUpdate(collegeId, {
          'location.address': scrapedData.address || college.location.address,
          'contact.phone': scrapedData.contact.phone || college.contact.phone,
          'contact.email': scrapedData.contact.email || college.contact.email,
          lastUpdated: Date.now()
        });

        console.log(`Updated data for ${college.name}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error updating college ${collegeId}:`, error);
      return false;
    }
  }

  // Batch update multiple colleges
  async batchUpdateColleges(limit = 10) {
    try {
      const colleges = await College.find({
        $or: [
          { lastUpdated: { $exists: false } },
          { lastUpdated: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // Older than 30 days
        ]
      }).limit(limit);

      const results = await Promise.allSettled(
        colleges.map(college => this.updateCollegeData(college._id))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return {
        total: colleges.length,
        successful,
        failed,
        colleges: colleges.map(c => c.name)
      };
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }
}

module.exports = DataScraper;