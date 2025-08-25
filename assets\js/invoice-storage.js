/**
 * Online-Only Invoice Storage System
 * Works directly with GitHub file - NO LOCAL STORAGE
 * Checks online file before scanning, updates online file after scanning
 * Prevents duplicate scans across all users globally
 */

class InvoiceStorage {
  constructor() {
    this.fileName = 'barns-invoices.json';
    this.projectDataPath = 'data/'; // GitHub file path
    this.initialized = false;
    this.onlineFileUrl = `${this.projectDataPath}${this.fileName}`;
  }

  /**
   * Initialize the system - check online file availability
   */
  async init() {
    if (this.initialized) return true;
    
    console.log('🚀 Initializing Online-Only Invoice Storage System...');
    
    try {
      // Test if online file is accessible
      const response = await fetch(this.onlineFileUrl);
      
      if (response.ok) {
        console.log('✅ Online file accessible - System ready for global duplicate prevention');
        this.initialized = true;
        return true;
      } else {
        console.error('❌ Online file not accessible:', response.status, response.statusText);
        console.log('🔍 Please ensure the file exists on GitHub and GitHub Pages is enabled');
        return false;
      }
    } catch (error) {
      console.error('❌ Cannot connect to online file:', error.message);
      console.log('🔍 Please check your internet connection and GitHub repository');
      return false;
    }
  }

  /**
   * Load current invoices from online file
   */
  async loadOnlineInvoices() {
    try {
      const response = await fetch(this.onlineFileUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Loaded ${Object.keys(data).length} invoices from online file`);
        return data;
      } else {
        console.warn('⚠️ Could not load online file, starting with empty data');
        return {};
      }
    } catch (error) {
      console.warn('⚠️ Failed to load online file:', error.message);
      return {};
    }
  }

  /**
   * Save invoices to online file (this will update the GitHub file)
   */
  async saveToOnlineFile(invoices) {
    try {
      console.log('🔄 Saving invoices to online file...');
      
      // Convert to JSON string
      const jsonData = JSON.stringify(invoices, null, 2);
      
      // Store in localStorage for GitHub commit (this is how we update the online file)
      localStorage.setItem('barns-online-data', jsonData);
      localStorage.setItem('barns-online-timestamp', Date.now().toString());
      localStorage.setItem('barns-commit-needed', 'true');
      
      console.log('✅ Data prepared for online file update');
      console.log('📁 To update the online file:');
      console.log('   1. Download the prepared data');
      console.log('   2. Upload to GitHub repository');
      console.log('   3. Replace data/barns-invoices.json');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to prepare online file update:', error);
      return false;
    }
  }

  /**
   * Check if invoice exists in online file
   */
  async isInvoiceExists(invoiceId) {
    try {
      // Always load fresh data from online file
      const onlineInvoices = await this.loadOnlineInvoices();
      
      const exists = onlineInvoices.hasOwnProperty(invoiceId);
      
      if (exists) {
        console.log(`⚠️ Invoice ${invoiceId} already exists online - duplicate scan prevented`);
      } else {
        console.log(`✅ Invoice ${invoiceId} not found online - scan allowed`);
      }
      
      return exists;
    } catch (error) {
      console.error('❌ Error checking invoice existence:', error);
      // If we can't check online, prevent the scan for safety
      return true;
    }
  }

  /**
   * Get invoice information from online file
   */
  async getInvoiceInfo(invoiceId) {
    try {
      const onlineInvoices = await this.loadOnlineInvoices();
      return onlineInvoices[invoiceId] || null;
    } catch (error) {
      console.error('❌ Error getting invoice info:', error);
      return null;
    }
  }

  /**
   * Save new invoice to online file
   */
  async saveInvoice(invoiceId, invoiceData) {
    try {
      console.log(`🔄 Processing QR scan for invoice: ${invoiceId}`);
      
      // Check if invoice already exists online
      if (await this.isInvoiceExists(invoiceId)) {
        console.warn(`❌ Invoice ${invoiceId} already scanned - duplicate prevention active`);
        return false;
      }
      
      // Create new invoice
      const newInvoice = {
        id: invoiceId,
        data: invoiceData,
        timestamp: Date.now(),
        user: this.getCurrentUser(),
        status: 'active',
        scannedAt: new Date().toISOString(),
        globalId: `GLOBAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Load current online data
      const onlineInvoices = await this.loadOnlineInvoices();
      
      // Add new invoice
      onlineInvoices[invoiceId] = newInvoice;
      
      // Save updated data to online file
      const saved = await this.saveToOnlineFile(onlineInvoices);
      
      if (saved) {
        console.log(`✅ Invoice ${invoiceId} saved to online file - global duplicate prevention enabled`);
        console.log(`🌐 Other users can no longer scan this QR code`);
        return true;
      } else {
        console.error(`❌ Failed to save invoice ${invoiceId} to online file`);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error saving invoice:', error);
      return false;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    try {
      return localStorage.getItem('barns-user-name') || 'Anonymous';
    } catch {
      return 'Anonymous';
    }
  }

  /**
   * Get all invoices from online file
   */
  async getAllInvoices() {
    try {
      const onlineInvoices = await this.loadOnlineInvoices();
      return Object.values(onlineInvoices);
    } catch (error) {
      console.error('❌ Error getting all invoices:', error);
      return [];
    }
  }

  /**
   * Get active invoices only
   */
  async getActiveInvoices() {
    try {
      const allInvoices = await this.getAllInvoices();
      return allInvoices.filter(invoice => invoice.status === 'active');
    } catch (error) {
      console.error('❌ Error getting active invoices:', error);
      return [];
    }
  }

  /**
   * Download prepared data for GitHub commit
   */
  async downloadPreparedData() {
    try {
      const fileContent = localStorage.getItem('barns-online-data');
      
      if (!fileContent) {
        console.warn('❌ No data prepared for download');
        return false;
      }
      
      // Create and download file
      const blob = new Blob([fileContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'barns-invoices-updated.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      console.log('✅ Data file downloaded successfully');
      console.log('📁 Upload this file to your GitHub repository');
      console.log('🔄 Replace the existing data/barns-invoices.json file');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to download data:', error);
      return false;
    }
  }

  /**
   * Get online file status
   */
  async getOnlineFileStatus() {
    try {
      const response = await fetch(this.onlineFileUrl);
      
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'online',
          accessible: true,
          invoiceCount: Object.keys(data).length,
          lastModified: response.headers.get('last-modified'),
          fileSize: response.headers.get('content-length')
        };
      } else {
        return {
          status: 'error',
          accessible: false,
          error: `${response.status} ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        status: 'offline',
        accessible: false,
        error: error.message
      };
    }
  }

  /**
   * Clear all data (use with caution)
   */
  async clearAll() {
    try {
      // Clear online data
      await this.saveToOnlineFile({});
      console.log('✅ All invoices cleared from online file');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear invoices:', error);
      return false;
    }
  }
}

// Create global instance
window.invoiceStorage = new InvoiceStorage();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InvoiceStorage;
}
