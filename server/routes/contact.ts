import express from 'express';
import { Contact, Notification } from '../../models';
import { EmailService } from '../../services/email-service';

const router = express.Router();

// Get all contact requests (Admin only)
router.get('/', async (req: any, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: contacts,
      message: req.i18n.formatSuccess('success')
    });
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ 
      success: false,
      error: req.i18n.formatError('error')
    });
  }
});

// Get contact by ID
router.get('/:id', async (req: any, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ 
        success: false,
        error: req.i18n.getTranslation('contact:messages.not_found')
      });
    }
    res.json({
      success: true,
      data: contact,
      message: req.i18n.formatSuccess('success')
    });
  } catch (error) {
    console.error('Error getting contact:', error);
    res.status(500).json({ 
      success: false,
      error: req.i18n.formatError('error')
    });
  }
});

import { contactRateLimiter, honeypotCheck, validateContactInput } from '../middleware/anti-spam';

// Submit contact form (Public with anti-spam & rate limiting)
router.post('/submit', contactRateLimiter, honeypotCheck, validateContactInput, async (req: any, res) => {
  try {
    const { name, phone, email, service, message } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !service) {
      return res.status(400).json({ 
        success: false,
        error: req.i18n.getTranslation('contact:form.required_fields')
      });
    }

    // Create contact record
    const contact = new Contact({
      name,
      phone,
      email,
      service,
      message: message || '',
      status: 'new'
    });

    await contact.save();

    // Send email notifications after saving the request. The contact record is
    // kept even if SMTP is temporarily unavailable, so no lead is lost.
    if (service.includes('Newsletter')) {
      // Newsletter subscription - Send welcome email only
      await Promise.all([
        EmailService.sendNewsletterWelcome(email),
        EmailService.sendContactNotification({
          name,
          phone,
          email,
          service,
          message: message || ''
        })
      ]);
    } else {
      const [notificationSent] = await Promise.all([
        // Email to the configured CTC contact recipient
        EmailService.sendContactNotification({
          name,
          phone,
          email,
          service,
          message: message || ''
        }),
        // Confirmation email to customer
        EmailService.sendCustomerConfirmation({
          name,
          phone,
          email,
          service,
          message: message || ''
        })
      ]);

      if (!notificationSent) {
        console.warn('Contact saved, but notification email could not be sent. Check SMTP configuration.');
      }
    }

    // Create notification in system
    try {
      const isNewsletter = service.includes('Newsletter');
      await Notification.create({
        type: isNewsletter ? 'info' : 'success',
        title: isNewsletter 
          ? req.i18n.getTranslation('contact:notifications.newsletter_signup')
          : req.i18n.getTranslation('contact:notifications.new_contact'),
        message: isNewsletter 
          ? req.i18n.getTranslation('contact:notifications.newsletter_description', { email })
          : req.i18n.getTranslation('contact:notifications.contact_description', { name, phone, service, email }),
        icon: isNewsletter ? '📰' : '📧',
        link: '/admin/contacts',
        isRead: false
      });
      console.log('✅ Notification created for new contact request');
    } catch (notifError) {
      console.error('❌ Error creating notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: req.i18n.getTranslation('contact:messages.submit_success'),
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email
      }
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ 
      success: false,
      error: req.i18n.getTranslation('contact:messages.submit_error')
    });
  }
});

// Update contact status (Admin only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

export default router;
