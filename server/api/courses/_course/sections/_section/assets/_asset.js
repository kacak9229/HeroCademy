const router = require('express').Router({ mergeParams: true })
const mongoose = require('mongoose')

const Course = require('../../../../../../models/Course')
const CourseSection = require('../../../../../../models/CourseSection')
const CourseSectionAsset = require('../../../../../../models/CourseSectionAsset')

// Gets a single course section asset
router.get('/', async (req, res) => {
  try {
    const course = await Course.findOne({
      slug: req.params.course
    }).lean()

    if (!course) {
      return res.json({
        success: false,
        courseSectionAsset: null
      })
    }

    if (
      !mongoose.Types.ObjectId.isValid(req.params.section) ||
      !mongoose.Types.ObjectId.isValid(req.params.asset)
    ) {
      return res.json({
        success: false,
        courseSectionAsset: null
      })
    }

    const courseSection = await CourseSection.findOne({
      _id: req.params.section,
      course: course._id
    }).lean()

    if (!courseSection) {
      return res.json({
        success: false,
        courseSectionAsset: null
      })
    }

    const courseSectionAsset = await CourseSectionAsset.findOne({
      courseSection: courseSection._id,
      _id: req.params.asset
    }).lean()

    const assetsInSection = await CourseSectionAsset.find({
      courseSection: courseSection._id
    })

    res.json({
      success: !!courseSectionAsset,
      courseSection,
      courseSectionAsset,
      assetsInSection
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

// Deletes a single course section asset
router.delete('/', async (req, res) => {
  try {
    const course = await Course.findOne({
      slug: req.params.course
    }).lean()

    if (!course) {
      return res.json({
        success: false,
        courseSectionAsset: null
      })
    }

    if (
      !mongoose.Types.ObjectId.isValid(req.params.section) ||
      !mongoose.Types.ObjectId.isValid(req.params.asset)
    ) {
      return res.json({
        success: false,
        courseSectionAsset: null
      })
    }

    const courseSection = await CourseSection.findOne({
      _id: req.params.section,
      course: course._id
    }).lean()

    if (!courseSection) {
      return res.json({
        success: false,
        courseSectionAsset: null
      })
    }

    const courseSectionAsset = await CourseSectionAsset.findOneAndDelete({
      courseSection: courseSection._id,
      _id: req.params.asset
    }).lean()

    if (courseSectionAsset) {
      const allAssets = await CourseSectionAsset.find({
        courseSection: courseSection._id
      })
        .sort({ position: 1 })
        .lean()

      await Promise.all(
        allAssets.map((asset, index) =>
          CourseSectionAsset.update(
            { _id: asset._id },
            { $set: { position: index } }
          )
        )
      )
    }

    res.json({
      success: !!courseSectionAsset,
      courseSectionAsset
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

// Updates a single course section asset
router.patch('/', async (req, res) => {
  try {
    const { body } = req
    const keys = ['name', 'description', 'file', 'type']

    const update = {}

    keys.forEach(key => {
      if (body[key]) update[key] = body[key]
    })

    const course = await Course.findOne({
      slug: req.params.course
    }).lean()

    if (!course) {
      return res.json({
        success: false,
        courseSectionAsset: null
      })
    }

    if (
      !mongoose.Types.ObjectId.isValid(req.params.section) ||
      !mongoose.Types.ObjectId.isValid(req.params.asset)
    ) {
      return res.json({
        success: false,
        courseSectionAsset: null
      })
    }

    const courseSection = await CourseSection.findOne({
      _id: req.params.section,
      course: course._id
    }).lean()

    if (!courseSection) {
      return res.json({
        success: false,
        courseSectionAsset: null
      })
    }

    const courseSectionAsset = await CourseSectionAsset.findOneAndUpdate(
      {
        courseSection: courseSection._id,
        _id: req.params.asset
      },
      update,
      { new: true }
    ).lean()

    res.json({
      success: !!courseSectionAsset,
      courseSectionAsset
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

module.exports = router
