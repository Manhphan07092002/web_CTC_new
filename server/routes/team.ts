import express from 'express';
import { TeamMember, SupportedLanguage, SUPPORTED_LANGUAGES } from '../models';
import { translateTeamMember } from '../services/translate';

const router = express.Router();

// Helper to get language from request
const getLanguage = (req: any): SupportedLanguage => {
  const lang = (req.query.lang as string) || 'vi';
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage) ? lang as SupportedLanguage : 'vi';
};

// Remove Vietnamese diacritics
const removeVietnameseDiacritics = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

// Get all active team members (for public view)
router.get('/', async (req, res) => {
  try {
    const lang = getLanguage(req);
    const members = await TeamMember.find({ isActive: true }).sort({ order: 1 }).lean();
    
    res.json(members.map((member: any) => {
      let role = member.role;
      let name = member.name;
      
      // Apply translation if not Vietnamese
      if (lang !== 'vi') {
        // Remove diacritics from name for non-Vietnamese languages
        name = removeVietnameseDiacritics(member.name);
        
        if (member.translations) {
          const trans = member.translations;
          // Handle both Map and plain object
          const langTrans = trans instanceof Map ? trans.get(lang) : trans[lang];
          if (langTrans && langTrans.role) {
            role = langTrans.role;
          }
        }
      }
      
      return {
        id: member._id.toString(),
        name: name,
        role: role,
        image: member.image,
        email: member.email,
        phone: member.phone,
        linkedin: member.linkedin,
        order: member.order,
        isActive: member.isActive
      };
    }));
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Get all team members (for admin)
router.get('/all', async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ order: 1 });
    res.json(members.map(member => ({
      id: member._id.toString(),
      name: member.name,
      role: member.role,
      image: member.image,
      email: member.email,
      phone: member.phone,
      linkedin: member.linkedin,
      order: member.order,
      isActive: member.isActive
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Get single team member
router.get('/:id', async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json({
      id: member._id.toString(),
      name: member.name,
      role: member.role,
      image: member.image,
      email: member.email,
      phone: member.phone,
      linkedin: member.linkedin,
      order: member.order,
      isActive: member.isActive
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team member' });
  }
});

// Create new team member
router.post('/', async (req, res) => {
  try {
    // Auto-translate team member
    const translatedData = await translateTeamMember(req.body);
    const member = new TeamMember(translatedData);
    await member.save();
    console.log('Team member created with translations:', member.name);
    res.status(201).json({
      id: member._id.toString(),
      name: member.name,
      role: member.role,
      image: member.image,
      email: member.email,
      phone: member.phone,
      linkedin: member.linkedin,
      order: member.order,
      isActive: member.isActive
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// Update team member
router.put('/:id', async (req, res) => {
  try {
    // Auto-translate updated content
    const translatedData = await translateTeamMember(req.body);
    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      translatedData,
      { new: true, runValidators: true }
    );
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    console.log('Team member updated with translations:', member.name);
    res.json({
      id: member._id.toString(),
      name: member.name,
      role: member.role,
      image: member.image,
      email: member.email,
      phone: member.phone,
      linkedin: member.linkedin,
      order: member.order,
      isActive: member.isActive
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// Delete team member
router.delete('/:id', async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

export default router;
