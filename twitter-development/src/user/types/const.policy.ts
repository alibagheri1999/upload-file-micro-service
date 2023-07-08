export const policy = (bucketName, maxObjects, maxSize) => {
    return `{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
              "AWS": "*"
            },
            "Action": [
              "s3:PutObject"
            ],
            "Resource": [
              "arn:aws:s3:::${bucketName}/*"
            ],
            "Condition": {
              "NumericLessThanEquals": {
                "s3:BucketSizeBytes": ${maxSize},
                "s3:PutObjectSizeBytes": ${maxSize}
              },
              "NumericLessThanEquals": {
                "s3:BucketObjectCount": ${maxObjects}
              }
            }
          }
        ]
}`;
}