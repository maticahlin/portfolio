import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
      description: 'Leave empty if not applicable'
    }),
    defineField({
      name: 'projectType',
      title: 'Project Type',
      type: 'string',
      description: 'e.g., "Freelance", "Personal Project", "Agency Work", "Passion Project"'
    }),
    defineField({
      name: 'role',
      title: 'Your Role',
      type: 'string',
      description: 'What you did on this project (e.g., "Designer & Developer", "Frontend Developer")'
    }),
    defineField({
      name: 'collaborators',
      title: 'Collaborators',
      type: 'string',
      description: 'Names of people you worked with'
    }),
    defineField({
      name: 'design',
      title: 'Design',
      type: 'string',
      description: 'Who handled design'
    }),
    defineField({
      name: 'development',
      title: 'Development',
      type: 'string',
      description: 'Who handled development'
    }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      description: 'e.g., "Website", "Mobile App", "Print", "Interactive Installation"',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'link',
      title: 'Project Link',
      type: 'url',
      description: 'Live site or project URL (optional)'
    }),
    defineField({
      name: 'subcategory',
      title: 'Subcategory',
      type: 'string',
      options: {
        list: [
          { title: 'Client Work', value: 'client' },
          { title: 'Creative Code', value: 'creative' },
          { title: 'Personal', value: 'personal' }
        ]
      },
      description: 'All projects appear in "All Projects" by default',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'string',
      description: 'Brief summary for status bar (~100 characters)',
      validation: Rule => Rule.required().max(150)
    }),
    defineField({
      name: 'longDescription',
      title: 'Long Description',
      type: 'text',
      description: 'Full project description for detail view',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'images',
      title: 'Project Images & Videos',
      type: 'array',
      of: [
        { type: 'image' },
        {
          type: 'file',
          options: {
            accept: 'video/mp4'
          }
        }
      ],
      description: 'One random item will be used in preview windows.',
      validation: Rule => Rule.required().min(1)
    }),
    defineField({
      name: 'isPinned',
      title: 'Featured Project',
      type: 'boolean',
      description: 'Show star icon in browser',
      initialValue: false
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first'
    })
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    }
  ]
})