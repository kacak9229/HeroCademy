const router = require('express').Router()

const Course = require('../../models/Course')
const User = require('../../models/User')

const upload = require('../../upload')
const _course = require('./_course')

const checkLecturerStatus = require('../../middleware/checkLecturerStatus')

// List all courses
router.get('/', async (req, res) => {
  const perPage = 5

  try {
    const page = Number(req.query.page) || 0
    const count = await Course.count({}).lean()

    let courses = []

    if (count > page * perPage) {
      courses = await Course.find({})
        .sort({ date: -1 })
        .skip(page * perPage)
        .limit(perPage)
        .populate('lecturer', 'role name email image')
        .lean()
    }

    res.json({
      success: true,
      courses,
      count,
      perPage
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

// Create new course
router.post(
  '/',
  checkLecturerStatus,
  upload.single('image'),
  async (req, res) => {
    try {
      // TODO: Use JOI to ensure all stuffs are filled before posting to MongoDb
      const { name, description } = req.body
      const { _id: lecturer } = req.user

      const course = new Course({
        name,
        description,
        image: req.file.location,
        lecturer
      })

      await course.save()

      res.json({
        success: !!course,
        course
      })
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      })
    }
  }
)

// TODO: Add Ownership check to _course
router.use('/:course', _course)

module.exports = router
